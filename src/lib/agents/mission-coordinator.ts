/**
 * Mission Trip Coordinator — manual.
 *
 * Builds the annual DR mission roster: pulls volunteer interest from members
 * who indicated availability, matches their specialty to clinic needs, and
 * drafts a logistics outline for the board.
 */
import { z } from 'zod'
import { runAgent, type AgentDef } from './runtime'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const SYSTEM = `You are the Mission Trip Coordinator Agent for the Dominican Medical Association of New York.

The DMA runs an annual 7-day medical mission to a partner clinic in the Dominican Republic. Your job, when triggered manually by the board:

1. list_volunteer_candidates — every member whose notes contain "mission" interest signals.
2. Score the roster against typical clinic needs (primary care 30%, OB/GYN 15%, pediatrics 15%, surgery 15%, dental 10%, IM 15%).
3. Draft a roster proposal: who fits where, where the gaps are, what specialties to recruit.
4. save_mission_proposal for the board.

Output format: clear bulleted board memo. Cite member names + specialties + tier. Flag gaps explicitly.`

const tools = [
  {
    name: 'list_volunteer_candidates',
    description: 'Members flagged as DR-mission interested (text-search of notes).',
    input_schema: { type: 'object', properties: {} },
    handler: async () => {
      const sb = getSupabaseAdmin()
      const { data, error } = await sb
        .from('members')
        .select('id, full_name, specialty, hospital_affiliation, country_of_training, member_tier, notes, languages')
        .or('notes.ilike.%mission%,notes.ilike.%volunteer%,notes.ilike.%DR%,notes.ilike.%dominican republic%')
        .eq('dues_status', 'active')
        .limit(100)
      if (error) return { error: error.message }
      return { count: data?.length ?? 0, candidates: data ?? [] }
    },
  },
  {
    name: 'save_mission_proposal',
    description: 'Persist the mission roster proposal for board review.',
    input_schema: {
      type: 'object',
      properties: {
        proposed_year: { type: 'number' },
        roster: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              member_id: { type: 'string' },
              role: { type: 'string' },
              fit_score: { type: 'number' },
            },
          },
        },
        gaps: { type: 'array', items: { type: 'string' } },
        memo: { type: 'string' },
      },
      required: ['proposed_year', 'roster', 'memo'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      await sb.from('audit_log').insert({
        actor_type: 'agent',
        actor_id: 'mission_coordinator',
        action: 'mission.roster_proposed',
        resource_type: 'mission',
        resource_id: String(args.proposed_year),
        after: args,
      })
      return { ok: true }
    },
  },
] satisfies AgentDef['tools']

export const missionCoordinatorAgent: AgentDef = { name: 'mission_coordinator', system: SYSTEM, tools }

const Ctx = z.object({
  year: z.number().int().optional(),
  trigger: z.enum(['cron', 'manual', 'webhook', 'event']).default('manual'),
})

export async function run(ctx: unknown = {}) {
  const parsed = Ctx.parse(ctx)
  const year = parsed.year ?? new Date().getFullYear() + 1
  return runAgent(missionCoordinatorAgent, {
    trigger: parsed.trigger,
    inputSummary: `DR mission roster proposal for ${year}`,
    initialMessage: `Build the DR medical mission roster proposal for ${year}. Pull interested volunteers, match specialties to typical clinic needs (primary care 30%, OB/GYN 15%, pediatrics 15%, surgery 15%, dental 10%, IM 15%), identify gaps, and save a board memo.`,
  })
}
