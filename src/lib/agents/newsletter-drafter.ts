/**
 * Newsletter Drafter Agent — biweekly cron (1st & 15th).
 *
 * Pulls the latest events, news (audit_log entries of type spotlight published),
 * and any milestone audit events; drafts a bilingual ¡Escucha Esto! newsletter
 * in EN + ES; persists the draft to audit_log for board review.
 */
import { z } from 'zod'
import { runAgent, type AgentDef } from './runtime'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const SYSTEM = `You are the Newsletter Drafter Agent for the Dominican Medical Association of New York.

Your biweekly job (1st and 15th of every month):
1. list_upcoming_events — get events scheduled in the next 30 days.
2. list_recent_milestones — pull the last 14 days of significant audit events (new members, approved applications, completed agent runs).
3. Draft a "¡Escucha Esto!" bilingual newsletter in EN + ES with these sections:
   - "What's coming up" (events)
   - "Member moves" (new members, recent approvals)
   - "Programs in motion" (USMLE cohorts, screenings, mission updates)
   - "Take action" (one CTA: donate, RSVP, refer a friend)
4. save_newsletter_draft to persist for board review. Subject: "¡Escucha Esto! · DMA Briefing · [date]"

Tone: warm, specific, not generic marketing speak. Reference real data — never invent.`

const tools = [
  {
    name: 'list_upcoming_events',
    description: 'List published events in the next N days.',
    input_schema: { type: 'object', properties: { days: { type: 'number', default: 30 } } },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const days = Number(args.days ?? 30)
      const cutoff = new Date(Date.now() + days * 86400e3).toISOString()
      const { data, error } = await sb
        .from('events')
        .select('title_en, title_es, subtitle_en, subtitle_es, start_at, location, cme_credits, is_member_only')
        .eq('status', 'published')
        .gte('start_at', new Date().toISOString())
        .lte('start_at', cutoff)
        .order('start_at')
      if (error) return { error: error.message }
      return { count: data?.length ?? 0, events: data ?? [] }
    },
  },
  {
    name: 'list_recent_milestones',
    description: 'Recent significant audit events (last N days): new members, approved apps, agent runs.',
    input_schema: { type: 'object', properties: { days: { type: 'number', default: 14 } } },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const days = Number(args.days ?? 14)
      const since = new Date(Date.now() - days * 86400e3).toISOString()
      const { data, error } = await sb
        .from('audit_log')
        .select('action, resource_type, after, at')
        .in('action', ['application.approved', 'member.created', 'agent.budget_reset'])
        .gte('at', since)
        .order('at', { ascending: false })
        .limit(50)
      if (error) return { error: error.message }
      return { count: data?.length ?? 0, events: data ?? [] }
    },
  },
  {
    name: 'save_newsletter_draft',
    description: 'Persist the newsletter draft to audit_log for board review.',
    input_schema: {
      type: 'object',
      properties: {
        subject_en: { type: 'string' },
        subject_es: { type: 'string' },
        body_en: { type: 'string' },
        body_es: { type: 'string' },
      },
      required: ['subject_en', 'subject_es', 'body_en', 'body_es'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      await sb.from('audit_log').insert({
        actor_type: 'agent',
        actor_id: 'newsletter_drafter',
        action: 'newsletter.drafted',
        resource_type: 'newsletter',
        resource_id: new Date().toISOString().slice(0, 10),
        after: args,
      })
      return { ok: true, queued_for_review: true }
    },
  },
] satisfies AgentDef['tools']

export const newsletterDrafterAgent: AgentDef = { name: 'newsletter_drafter', system: SYSTEM, tools }

const Ctx = z.object({ trigger: z.enum(['cron', 'manual', 'webhook', 'event']).default('cron') })

export async function run(ctx: unknown = {}) {
  const parsed = Ctx.parse(ctx)
  return runAgent(newsletterDrafterAgent, {
    trigger: parsed.trigger,
    inputSummary: '¡Escucha Esto! biweekly draft',
    initialMessage:
      'Draft the next ¡Escucha Esto! newsletter. Pull upcoming events (30d) and recent milestones (14d), then write a warm bilingual EN+ES draft and save it for board review.',
  })
}
