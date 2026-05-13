/**
 * Donation Acknowledgment Agent — fired by the Stripe webhook.
 *
 * Drafts a personal bilingual thank-you. If amount < approval_threshold (1000),
 * marks as auto-approved (institution_manager can review later).
 * If amount ≥ threshold, marks requires_approval=true so a board member must
 * approve before it goes out.
 */
import { z } from 'zod'
import { runAgent, type AgentDef } from './runtime'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const APPROVAL_THRESHOLD_CENTS = 100000

const SYSTEM = `You are the Donation Acknowledgment Agent for the Dominican Medical Association of New York (DMA).

When a new donation arrives via Stripe, your job:
1. lookup_donation by ID — get amount, donor, intent.
2. Draft a warm, personal bilingual thank-you (EN + ES). Never form-letter. Reference:
   - The exact dollar amount and what it concretely funds (use the named-impact mapping in the system prompt below).
   - The donor's name if provided.
   - The intent if specified (general / mock_interview / mission_day / etc.).
3. save_thank_you with both EN and ES versions.

NAMED-IMPACT MAPPING (use to make thanks concrete):
- $50  → 1 hour of IMG mock-interview prep (any nationality)
- $100 → 1 IMG month of USMLE Qbank subscription
- $250 → 1 community health screening event
- $500 → 1 day of supplies for the DR medical mission
- $1,000 → 1 bilingual med-student summer fellowship
- $5,000 → 1 day of full-team DR mission
- Other amounts → bundle with the closest impact

Tone: grateful, specific, never saccharine. Sign as the DMA Board.`

const tools = [
  {
    name: 'lookup_donation',
    description: 'Fetch donation by ID.',
    input_schema: { type: 'object', properties: { donation_id: { type: 'string' } }, required: ['donation_id'] },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const { data, error } = await sb.from('donations').select('*').eq('id', args.donation_id as string).single()
      if (error) return { error: error.message }
      return data
    },
  },
  {
    name: 'save_thank_you',
    description: 'Persist the bilingual thank-you draft. Auto-approves under 1000 cents threshold; flags above.',
    input_schema: {
      type: 'object',
      properties: {
        donation_id: { type: 'string' },
        subject_en: { type: 'string' },
        subject_es: { type: 'string' },
        body_en: { type: 'string' },
        body_es: { type: 'string' },
      },
      required: ['donation_id', 'subject_en', 'subject_es', 'body_en', 'body_es'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const { data: donation } = await sb
        .from('donations')
        .select('amount_cents')
        .eq('id', args.donation_id as string)
        .single()
      const requiresApproval = (donation?.amount_cents ?? 0) >= APPROVAL_THRESHOLD_CENTS

      const { error } = await sb
        .from('donations')
        .update({
          thank_you_drafted_at: new Date().toISOString(),
          thank_you_drafted_by_agent: true,
          ...(requiresApproval ? {} : { thank_you_sent_at: new Date().toISOString() }),
        })
        .eq('id', args.donation_id as string)
      if (error) return { ok: false, error: error.message }

      await sb.from('audit_log').insert({
        actor_type: 'agent',
        actor_id: 'donation_acknowledgment',
        action: requiresApproval ? 'donation.thank_you_drafted_pending_approval' : 'donation.thank_you_auto_sent',
        resource_type: 'donation',
        resource_id: args.donation_id,
        after: {
          subject_en: args.subject_en,
          subject_es: args.subject_es,
          body_en: args.body_en,
          body_es: args.body_es,
          requires_approval: requiresApproval,
        },
      })
      return { ok: true, requires_approval: requiresApproval }
    },
  },
] satisfies AgentDef['tools']

export const donationAcknowledgmentAgent: AgentDef = { name: 'donation_acknowledgment', system: SYSTEM, tools }

const Ctx = z.object({
  donationId: z.string().uuid().optional(),
  trigger: z.enum(['cron', 'manual', 'webhook', 'event']).default('webhook'),
})

export async function run(ctx: unknown = {}) {
  const parsed = Ctx.parse(ctx)
  return runAgent(donationAcknowledgmentAgent, {
    trigger: parsed.trigger,
    inputSummary: parsed.donationId ? `Acknowledge donation ${parsed.donationId}` : 'Manual run with no donation id',
    initialMessage: parsed.donationId
      ? `New donation arrived: id ${parsed.donationId}. Look it up, draft a personal bilingual thank-you, and save it.`
      : 'No donation ID provided. Stop and report that you need a donation_id to proceed.',
  })
}
