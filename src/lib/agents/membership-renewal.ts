/**
 * Membership Renewal Agent
 *
 * Daily cron (14:00 UTC = 9 AM ET). For each member whose dues_expires_at
 * falls 30 / 14 / 7 days from today, drafts a bilingual renewal email and
 * either auto-sends (if amount ≤ approval_threshold) or queues for board approval.
 */
import { z } from 'zod'
import { runAgent, type AgentDef } from './runtime'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const SYSTEM = `You are the Membership Renewal Agent for the Dominican Medical Association of New York (DMA), a 501(c) nonprofit founded April 1997.

Today's job:
1. Use list_members_due_to_renew with offset_days = 30, then 14, then 7. Together this surfaces every member whose dues expire in the next 30 / 14 / 7 days.
2. For each member, draft a personal bilingual renewal email tailored to their tier, member_since, country_of_training, and specialty.
3. Use queue_renewal_email to persist the draft. The institution_manager will review the queue and send.

Tone: warm, specific, never form-letter. Address the member by name. Reference one personal detail from their record (specialty, hospital, country of training, or member_since year). Always include both EN and ES versions in the body.

Member tiers: active ($200/yr), resident ($50/yr), student (free), sponsor ($1000/yr).

Never auto-send. Always queue.`

const tools = [
  {
    name: 'list_members_due_to_renew',
    description: 'List active members whose dues expire in exactly the offset days from today.',
    input_schema: {
      type: 'object',
      properties: { offset_days: { type: 'number', enum: [30, 14, 7] } },
      required: ['offset_days'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const offset = Number(args.offset_days)
      const target = new Date()
      target.setDate(target.getDate() + offset)
      const targetIso = target.toISOString().slice(0, 10)
      const { data, error } = await sb
        .from('members')
        .select('id, full_name, email, member_tier, member_since, dues_expires_at, country_of_training, specialty, hospital_affiliation')
        .eq('dues_expires_at', targetIso)
        .in('dues_status', ['active', 'grace'])
      if (error) return { error: error.message }
      return { count: data?.length ?? 0, members: data ?? [] }
    },
  },
  {
    name: 'queue_renewal_email',
    description: 'Persist a renewal email draft for board/institution_manager review.',
    input_schema: {
      type: 'object',
      properties: {
        member_id: { type: 'string' },
        offset_days: { type: 'number' },
        subject_en: { type: 'string' },
        subject_es: { type: 'string' },
        body_en: { type: 'string' },
        body_es: { type: 'string' },
      },
      required: ['member_id', 'offset_days', 'subject_en', 'subject_es', 'body_en', 'body_es'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      // Use audit_log as the queue for now (full queue table can come later)
      await sb.from('audit_log').insert({
        actor_type: 'agent',
        actor_id: 'membership_renewal',
        action: 'renewal_email.drafted',
        resource_type: 'member',
        resource_id: args.member_id,
        after: {
          offset_days: args.offset_days,
          subject_en: args.subject_en,
          subject_es: args.subject_es,
          body_en: args.body_en,
          body_es: args.body_es,
        },
      })
      return { ok: true, queued: true }
    },
  },
] satisfies AgentDef['tools']

export const membershipRenewalAgent: AgentDef = {
  name: 'membership_renewal',
  system: SYSTEM,
  tools,
}

const Ctx = z.object({
  trigger: z.enum(['cron', 'manual', 'webhook', 'event']).default('cron'),
})

export async function run(ctx: unknown = {}) {
  const parsed = Ctx.parse(ctx)
  return runAgent(membershipRenewalAgent, {
    trigger: parsed.trigger,
    inputSummary: 'Daily renewal sweep — 30/14/7 day windows',
    initialMessage:
      'Run the daily renewal sweep. For each of the 30/14/7 day windows, list members whose dues expire that day, then draft and queue a personalized bilingual renewal email for each.',
  })
}
