import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { triggerAgent } from '@/lib/agents/runtime'

export const runtime = 'nodejs'

const Schema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(40),
  country_of_training: z.string().min(2).max(80),
  npi: z.string().regex(/^\d{10}$/).optional().or(z.literal('').transform(() => undefined)),
  specialty: z.string().min(2).max(80),
  hospital_affiliation: z.string().max(120).optional().or(z.literal('').transform(() => undefined)),
  languages: z.union([z.array(z.string()), z.string()]).transform((v) => (Array.isArray(v) ? v : [v])).optional(),
  tier: z.enum(['active', 'resident', 'student', 'sponsor']),
  motivation: z.string().min(20).max(2000),
})

export async function POST(req: NextRequest) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // FormData arrays of `languages[]` come in as repeated keys; normalize:
  if (payload && typeof payload === 'object' && !('languages' in payload) && 'languages[]' in (payload as Record<string, unknown>)) {
    ;(payload as Record<string, unknown>).languages = (payload as Record<string, unknown>)['languages[]']
  }

  const parsed = Schema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ua = req.headers.get('user-agent') ?? undefined

  if (!isSupabaseConfigured) {
    // Demo mode — log + return success without persisting
    console.log('[applications] DEMO mode (Supabase not configured):', { ...data, ip })
    return NextResponse.json({ ok: true, demo: true })
  }

  try {
    const sb = getSupabaseAdmin()
    const { data: row, error } = await sb
      .from('applications')
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        country_of_training: data.country_of_training,
        npi: data.npi ?? null,
        specialty: data.specialty,
        hospital_affiliation: data.hospital_affiliation ?? null,
        languages: data.languages ?? [],
        tier: data.tier,
        motivation: data.motivation,
        ip_address: ip ?? null,
        user_agent: ua ?? null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[applications] insert error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Audit
    await sb.from('audit_log').insert({
      actor_type: 'webhook',
      actor_id: 'public_apply',
      action: 'application.submitted',
      resource_type: 'application',
      resource_id: row.id,
      after: data,
      ip_address: ip ?? null,
      user_agent: ua ?? null,
    })

    // Fire-and-forget: trigger Application Triage Agent
    triggerAgent('application_triage', { applicationId: row.id, trigger: 'webhook' }).catch((err) => {
      console.error('[applications] triage trigger failed:', err)
    })

    return NextResponse.json({ ok: true, id: row.id })
  } catch (err) {
    console.error('[applications] unexpected:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
