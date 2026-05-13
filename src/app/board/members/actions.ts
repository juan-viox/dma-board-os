'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'

const TIER = z.enum(['active', 'resident', 'student', 'sponsor', 'honorary'])
const DUES = z.enum(['pending', 'active', 'grace', 'expired', 'exempt'])

const NewMember = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal('').transform(() => undefined)),
  npi: z.string().regex(/^\d{10}$/).optional().or(z.literal('').transform(() => undefined)),
  specialty: z.string().max(80).optional().or(z.literal('').transform(() => undefined)),
  hospital_affiliation: z.string().max(120).optional().or(z.literal('').transform(() => undefined)),
  borough: z.string().max(40).optional().or(z.literal('').transform(() => undefined)),
  country_of_training: z.string().max(80).optional().or(z.literal('').transform(() => undefined)),
  member_tier: TIER.default('active'),
  notes: z.string().max(2000).optional().or(z.literal('').transform(() => undefined)),
})

type Result = { ok: boolean; error?: string; id?: string }

async function getReviewerProfileId() {
  const { userId } = await auth()
  if (!userId) return null
  const sb = getSupabaseAdmin()
  const { data } = await sb.from('profiles').select('id').eq('clerk_user_id', userId).maybeSingle()
  return data?.id ?? null
}

/** Create a member from the board (offline import or manual add). */
export async function createMember(input: unknown): Promise<Result> {
  try {
    await requireRole('institution_manager')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  const parsed = NewMember.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'validation: ' + JSON.stringify(parsed.error.flatten().fieldErrors) }

  const sb = getSupabaseAdmin()
  const today = new Date()
  const expires = new Date(today)
  expires.setFullYear(expires.getFullYear() + 1)

  const { data, error } = await sb
    .from('members')
    .insert({
      ...parsed.data,
      member_since: today.toISOString().slice(0, 10),
      dues_status: parsed.data.member_tier === 'student' ? 'exempt' : 'active',
      dues_expires_at: parsed.data.member_tier === 'student' ? null : expires.toISOString().slice(0, 10),
      npi_verification_status: parsed.data.npi ? 'unverified' : 'not_applicable',
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: await getReviewerProfileId(),
    action: 'member.created',
    resource_type: 'member',
    resource_id: data.id,
    after: parsed.data,
  })

  revalidatePath('/board/members')
  revalidatePath('/board')
  return { ok: true, id: data.id }
}

/** Mark dues as renewed for one year. */
export async function markRenewed(memberId: string): Promise<Result> {
  try {
    await requireRole('institution_manager')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  const sb = getSupabaseAdmin()
  const { data: m } = await sb.from('members').select('dues_expires_at, member_tier').eq('id', memberId).single()
  if (!m) return { ok: false, error: 'member not found' }

  const base = m.dues_expires_at && new Date(m.dues_expires_at) > new Date() ? new Date(m.dues_expires_at) : new Date()
  const next = new Date(base)
  next.setFullYear(next.getFullYear() + 1)

  const { error } = await sb
    .from('members')
    .update({ dues_status: 'active', dues_expires_at: next.toISOString().slice(0, 10) })
    .eq('id', memberId)
  if (error) return { ok: false, error: error.message }

  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: await getReviewerProfileId(),
    action: 'member.dues_renewed',
    resource_type: 'member',
    resource_id: memberId,
    after: { dues_expires_at: next.toISOString().slice(0, 10) },
  })

  revalidatePath('/board/members')
  revalidatePath('/board')
  return { ok: true }
}

const TierUpdate = z.object({ id: z.string().uuid(), tier: TIER, dues: DUES.optional() })

export async function changeMemberTier(input: unknown): Promise<Result> {
  try {
    await requireRole('board_member')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  const parsed = TierUpdate.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'validation' }
  const sb = getSupabaseAdmin()
  const { error } = await sb
    .from('members')
    .update({ member_tier: parsed.data.tier, ...(parsed.data.dues ? { dues_status: parsed.data.dues } : {}) })
    .eq('id', parsed.data.id)
  if (error) return { ok: false, error: error.message }

  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: await getReviewerProfileId(),
    action: 'member.tier_changed',
    resource_type: 'member',
    resource_id: parsed.data.id,
    after: { tier: parsed.data.tier, dues: parsed.data.dues ?? null },
  })

  revalidatePath('/board/members')
  return { ok: true }
}
