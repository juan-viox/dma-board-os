/**
 * NPI Verification Agent — monthly cron.
 *
 * Walks every member with an NPI on file, queries CMS NPPES, and updates
 * `npi_verification_status` to verified / revoked / unverified.
 * Flags any newly-revoked records for board attention via audit_log.
 */
import { z } from 'zod'
import { runAgent, type AgentDef } from './runtime'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const SYSTEM = `You are the NPI Verification Agent for the Dominican Medical Association of New York (DMA).

Your monthly job:
1. list_members_with_npi — get every member with an NPI on file (paginated if >200).
2. For each member, verify_npi against CMS NPPES.
3. update_npi_status with the verification result.
4. If status changes from verified→revoked, flag for board (handled automatically by update_npi_status when result === 'revoked').
5. Stop after processing the batch returned by list_members_with_npi (don't loop infinitely).

Be efficient — use bulk_update_npi_statuses if you've gathered multiple results at once.`

const tools = [
  {
    name: 'list_members_with_npi',
    description: 'List all members with an NPI on file, oldest verification first.',
    input_schema: { type: 'object', properties: { limit: { type: 'number', maximum: 200, default: 100 } } },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const limit = Number(args.limit ?? 100)
      const { data, error } = await sb
        .from('members')
        .select('id, full_name, npi, npi_verification_status, npi_verified_at')
        .not('npi', 'is', null)
        .order('npi_verified_at', { ascending: true, nullsFirst: true })
        .limit(limit)
      if (error) return { error: error.message }
      return { count: data?.length ?? 0, members: data ?? [] }
    },
  },
  {
    name: 'verify_npi',
    description: 'Verify a single NPI against CMS NPPES public registry.',
    input_schema: {
      type: 'object',
      properties: { npi: { type: 'string', pattern: '^\\d{10}$' } },
      required: ['npi'],
    },
    handler: async (args: Record<string, unknown>) => {
      const npi = String(args.npi)
      try {
        const res = await fetch(`https://npiregistry.cms.hhs.gov/api/?number=${encodeURIComponent(npi)}&version=2.1`)
        if (!res.ok) return { verified: false, error: `NPPES HTTP ${res.status}` }
        const json = (await res.json()) as { result_count: number; results?: Array<{ basic?: { status?: string } }> }
        if (!json.result_count || !json.results?.[0]) return { verified: false, status: 'revoked', reason: 'No NPPES match' }
        const status = json.results[0].basic?.status
        return { verified: status === 'A', nppes_status: status }
      } catch (err) {
        return { verified: false, error: err instanceof Error ? err.message : String(err) }
      }
    },
  },
  {
    name: 'update_npi_status',
    description: 'Persist the NPI verification result onto a member.',
    input_schema: {
      type: 'object',
      properties: {
        member_id: { type: 'string' },
        status: { type: 'string', enum: ['verified', 'unverified', 'revoked', 'not_applicable'] },
      },
      required: ['member_id', 'status'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const { error } = await sb
        .from('members')
        .update({
          npi_verification_status: args.status,
          npi_verified_at: new Date().toISOString(),
        })
        .eq('id', args.member_id as string)
      if (error) return { ok: false, error: error.message }
      await sb.from('audit_log').insert({
        actor_type: 'agent',
        actor_id: 'npi_verification',
        action: args.status === 'revoked' ? 'member.npi_revoked' : 'member.npi_verified',
        resource_type: 'member',
        resource_id: args.member_id,
        after: { status: args.status },
      })
      return { ok: true }
    },
  },
] satisfies AgentDef['tools']

export const npiVerificationAgent: AgentDef = { name: 'npi_verification', system: SYSTEM, tools }

const Ctx = z.object({ trigger: z.enum(['cron', 'manual', 'webhook', 'event']).default('cron') })

export async function run(ctx: unknown = {}) {
  const parsed = Ctx.parse(ctx)
  return runAgent(npiVerificationAgent, {
    trigger: parsed.trigger,
    inputSummary: 'Monthly NPI verification sweep',
    initialMessage:
      'Run the monthly NPI sweep. Pull the next batch (limit 100) of members with NPIs sorted by oldest verification, verify each against NPPES, update status. Stop after processing the batch.',
  })
}
