'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/roles'

type ActionResult = { ok: boolean; error?: string; member_id?: string }

/**
 * Approve a membership application: flip status, create a `members` row, link
 * back to the application via `member_id`, audit-log everything. Idempotent.
 */
export async function approveApplication(applicationId: string): Promise<ActionResult> {
  try {
    await requireRole('board_member')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  const { userId } = await auth()
  const sb = getSupabaseAdmin()

  // Pull profile id (so audit + reviewed_by uses the Supabase profile uuid, not clerk id)
  const { data: profile } = await sb
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId!)
    .maybeSingle()
  const reviewerProfileId = profile?.id ?? null

  // Load the application
  const { data: app, error: loadErr } = await sb
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()
  if (loadErr || !app) return { ok: false, error: loadErr?.message ?? 'application not found' }
  if (app.status === 'approved' && app.member_id) {
    return { ok: true, member_id: app.member_id }
  }

  // Compute initial dues window
  const today = new Date()
  const expiresAt = new Date(today)
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  // Create the member record
  const { data: member, error: memberErr } = await sb
    .from('members')
    .insert({
      full_name: app.full_name,
      email: app.email,
      phone: app.phone,
      npi: app.npi,
      npi_verification_status: app.npi ? 'unverified' : 'not_applicable',
      specialty: app.specialty,
      hospital_affiliation: app.hospital_affiliation,
      languages: app.languages ?? [],
      country_of_training: app.country_of_training,
      member_tier: app.tier,
      member_since: fmt(today),
      dues_status: app.tier === 'student' ? 'exempt' : 'active',
      dues_expires_at: app.tier === 'student' ? null : fmt(expiresAt),
    })
    .select('id')
    .single()
  if (memberErr || !member) return { ok: false, error: memberErr?.message ?? 'member insert failed' }

  // Update application
  const { error: updateErr } = await sb
    .from('applications')
    .update({
      status: 'approved',
      reviewed_by: reviewerProfileId,
      reviewed_at: new Date().toISOString(),
      member_id: member.id,
    })
    .eq('id', applicationId)
  if (updateErr) return { ok: false, error: updateErr.message }

  // Audit
  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: reviewerProfileId,
    action: 'application.approved',
    resource_type: 'application',
    resource_id: applicationId,
    after: { status: 'approved', member_id: member.id, tier: app.tier },
  })

  revalidatePath('/board/applications')
  revalidatePath('/board/members')
  revalidatePath('/board')
  return { ok: true, member_id: member.id }
}

export async function rejectApplication(applicationId: string, reason?: string): Promise<ActionResult> {
  try {
    await requireRole('board_member')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  const { userId } = await auth()
  const sb = getSupabaseAdmin()
  const { data: profile } = await sb
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId!)
    .maybeSingle()
  const reviewerProfileId = profile?.id ?? null

  const { error } = await sb
    .from('applications')
    .update({
      status: 'rejected',
      reviewed_by: reviewerProfileId,
      reviewed_at: new Date().toISOString(),
      triage_memo: reason ? `[Reviewer] ${reason}\n\n` + (await getMemo(applicationId, sb)) : undefined,
    })
    .eq('id', applicationId)
  if (error) return { ok: false, error: error.message }

  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: reviewerProfileId,
    action: 'application.rejected',
    resource_type: 'application',
    resource_id: applicationId,
    after: { status: 'rejected', reason: reason ?? null },
  })
  revalidatePath('/board/applications')
  revalidatePath('/board')
  return { ok: true }
}

export async function requestMoreInfo(applicationId: string, message: string): Promise<ActionResult> {
  try {
    await requireRole('institution_manager')
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unauthorized' }
  }
  const { userId } = await auth()
  const sb = getSupabaseAdmin()
  const { data: profile } = await sb
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId!)
    .maybeSingle()
  const reviewerProfileId = profile?.id ?? null

  const { error } = await sb
    .from('applications')
    .update({
      status: 'board_review',
      reviewed_by: reviewerProfileId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
  if (error) return { ok: false, error: error.message }

  await sb.from('audit_log').insert({
    actor_type: 'user',
    actor_id: reviewerProfileId,
    action: 'application.info_requested',
    resource_type: 'application',
    resource_id: applicationId,
    after: { message },
  })
  // TODO: send email via Resend in next phase
  revalidatePath('/board/applications')
  return { ok: true }
}

async function getMemo(applicationId: string, sb: ReturnType<typeof getSupabaseAdmin>): Promise<string> {
  const { data } = await sb.from('applications').select('triage_memo').eq('id', applicationId).single()
  return data?.triage_memo ?? ''
}
