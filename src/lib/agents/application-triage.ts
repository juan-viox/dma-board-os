/**
 * Application Triage Agent
 *
 * Triggered immediately after a public membership application is submitted.
 * Reads the application, optionally verifies the NPI against CMS NPPES,
 * scores the applicant's fit (0–10), surfaces red flags, and writes a board
 * memo back into `applications.triage_memo`.
 *
 * The board still makes the final decision — this agent only drafts.
 */
import { z } from 'zod'
import { runAgent, type AgentDef } from './runtime'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const SYSTEM = `You are the Application Triage Agent for the Dominican Medical Association of New York (DMA), a 501(c) nonprofit founded April 1997.

DMA was founded by Dominican-heritage physicians but serves IMGs of every nationality (Colombian, Cuban, Venezuelan, Mexican, Puerto Rican, Spanish, Haitian, Filipino, etc.) plus US-trained physicians serving the Hispanic + Caribbean communities of NYC.

Your job for each new application:
1. Use lookup_application to read the full submission.
2. If an NPI is provided, use verify_npi to check it against CMS NPPES.
3. Score fit 0.0–10.0 based on: alignment with DMA mission, plausibility of stated motivation, completeness, NPI verification result, hospital affiliation, language fluency.
4. Identify any red flags: NPI revoked or unmatched, generic copy-pasted motivation, suspicious email pattern, mismatched specialty/hospital combos, etc.
5. Write a 2-3 paragraph board memo (clear, neutral, evidence-cited) and use save_triage_memo to persist it.
6. Update the application status to 'triaged' or, if obvious red flag, 'duplicate' (only for duplicate detection).

Keep memos concise and factual. Never make the final decision — just inform the board.`

const tools = [
  {
    name: 'lookup_application',
    description: 'Fetch the full application by ID.',
    input_schema: {
      type: 'object',
      properties: { application_id: { type: 'string', description: 'UUID of the application' } },
      required: ['application_id'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const { data, error } = await sb.from('applications').select('*').eq('id', args.application_id as string).single()
      if (error) return { error: error.message }
      return data
    },
  },
  {
    name: 'verify_npi',
    description: 'Verify a 10-digit NPI against CMS NPPES public registry.',
    input_schema: {
      type: 'object',
      properties: { npi: { type: 'string', pattern: '^\\d{10}$' } },
      required: ['npi'],
    },
    handler: async (args: Record<string, unknown>) => {
      const npi = String(args.npi)
      try {
        const res = await fetch(
          `https://npiregistry.cms.hhs.gov/api/?number=${encodeURIComponent(npi)}&version=2.1`
        )
        if (!res.ok) return { verified: false, error: `NPPES HTTP ${res.status}` }
        const json = (await res.json()) as { result_count: number; results?: unknown[] }
        if (!json.result_count || !json.results?.[0]) return { verified: false, reason: 'No NPPES match' }
        return { verified: true, nppes_record: json.results[0] }
      } catch (err) {
        return { verified: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
  },
  {
    name: 'save_triage_memo',
    description: 'Persist the triage memo + score + red flags + new status onto the application row.',
    input_schema: {
      type: 'object',
      properties: {
        application_id: { type: 'string' },
        memo: { type: 'string' },
        score: { type: 'number' },
        red_flags: { type: 'array', items: { type: 'string' } },
        new_status: { type: 'string', enum: ['triaged', 'duplicate'] },
      },
      required: ['application_id', 'memo', 'score', 'new_status'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const { error } = await sb
        .from('applications')
        .update({
          triage_memo: args.memo,
          triage_score: args.score,
          triage_red_flags: args.red_flags ?? [],
          status: args.new_status,
        })
        .eq('id', args.application_id as string)
      if (error) return { ok: false, error: error.message }

      await sb.from('audit_log').insert({
        actor_type: 'agent',
        actor_id: 'application_triage',
        action: 'application.triaged',
        resource_type: 'application',
        resource_id: args.application_id,
        after: { score: args.score, status: args.new_status, red_flags: args.red_flags },
      })
      return { ok: true }
    },
  },
] satisfies AgentDef['tools']

export const applicationTriageAgent: AgentDef = {
  name: 'application_triage',
  system: SYSTEM,
  tools,
}

const Ctx = z.object({
  applicationId: z.string().uuid(),
  trigger: z.enum(['cron', 'manual', 'webhook', 'event']).default('webhook'),
})

export async function run(ctx: unknown) {
  const parsed = Ctx.parse(ctx)
  return runAgent(applicationTriageAgent, {
    trigger: parsed.trigger,
    inputSummary: `Triage application ${parsed.applicationId}`,
    initialMessage: `New application submitted with ID ${parsed.applicationId}. Read it, verify NPI if provided, score fit 0–10, identify red flags, write a board memo, and save_triage_memo.`,
  })
}
