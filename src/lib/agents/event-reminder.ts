/**
 * Event Reminder Agent — daily cron.
 *
 * For each event coming up in 7d / 1d / 3hr, drafts bilingual reminder
 * (email + optional SMS) for every RSVP'd attendee, and stamps the
 * appropriate `reminder_sent_*_at` columns to prevent duplicates.
 *
 * Sends via the Resend API stub (real send wired in next phase).
 */
import { z } from 'zod'
import { runAgent, type AgentDef } from './runtime'
import { getSupabaseAdmin } from '@/lib/supabase/server'

const SYSTEM = `You are the Event Reminder Agent for the Dominican Medical Association of New York.

Your daily job:
1. find_upcoming_events_at_intervals — get events at exactly 7d, 1d, and 3h from now.
2. For each event, fetch the RSVP roster (only those who haven't already received that interval's reminder).
3. Draft a bilingual EN+ES reminder body (warm, specific, includes the location, time, and any prep notes).
4. queue_reminders to write the drafts and stamp reminder_sent timestamps.

Be efficient: one queue_reminders call per event (with all attendees in the batch).`

const tools = [
  {
    name: 'find_upcoming_events_at_intervals',
    description: 'List events whose start_at falls in any of: ~7d, ~1d, ~3h windows.',
    input_schema: { type: 'object', properties: {} },
    handler: async () => {
      const sb = getSupabaseAdmin()
      const windows = [
        { label: '7d', startMs: 7 * 86400e3, endMs: 8 * 86400e3 },
        { label: '1d', startMs: 1 * 86400e3, endMs: 1.5 * 86400e3 },
        { label: '3h', startMs: 3 * 3600e3, endMs: 4 * 3600e3 },
      ]
      const out: Array<{ window: string; events: unknown[] }> = []
      for (const w of windows) {
        const start = new Date(Date.now() + w.startMs).toISOString()
        const end = new Date(Date.now() + w.endMs).toISOString()
        const { data } = await sb
          .from('events')
          .select('id, title_en, title_es, start_at, location, capacity, is_member_only')
          .eq('status', 'published')
          .gte('start_at', start)
          .lt('start_at', end)
        out.push({ window: w.label, events: data ?? [] })
      }
      return { intervals: out }
    },
  },
  {
    name: 'get_rsvps_for_event',
    description: 'List RSVPs for an event filtered to those who have not yet received this interval reminder.',
    input_schema: {
      type: 'object',
      properties: {
        event_id: { type: 'string' },
        interval: { type: 'string', enum: ['7d', '1d'] },
      },
      required: ['event_id', 'interval'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const col = args.interval === '7d' ? 'reminder_sent_7d_at' : 'reminder_sent_1d_at'
      const { data, error } = await sb
        .from('event_rsvps')
        .select('id, email, full_name, party_size')
        .eq('event_id', args.event_id as string)
        .is(col, null)
      if (error) return { error: error.message }
      return { count: data?.length ?? 0, rsvps: data ?? [] }
    },
  },
  {
    name: 'queue_reminders',
    description:
      'Write reminder drafts to audit_log + stamp reminder_sent_*_at on each RSVP row. Resend send happens in next-phase email worker.',
    input_schema: {
      type: 'object',
      properties: {
        event_id: { type: 'string' },
        interval: { type: 'string', enum: ['7d', '1d'] },
        subject_en: { type: 'string' },
        subject_es: { type: 'string' },
        body_en: { type: 'string' },
        body_es: { type: 'string' },
        rsvp_ids: { type: 'array', items: { type: 'string' } },
      },
      required: ['event_id', 'interval', 'subject_en', 'subject_es', 'body_en', 'body_es', 'rsvp_ids'],
    },
    handler: async (args: Record<string, unknown>) => {
      const sb = getSupabaseAdmin()
      const col = args.interval === '7d' ? 'reminder_sent_7d_at' : 'reminder_sent_1d_at'
      const ids = args.rsvp_ids as string[]
      if (!ids.length) return { ok: true, queued: 0 }

      const { error } = await sb.from('event_rsvps').update({ [col]: new Date().toISOString() }).in('id', ids)
      if (error) return { ok: false, error: error.message }

      await sb.from('audit_log').insert({
        actor_type: 'agent',
        actor_id: 'event_reminder',
        action: `event.reminder_${args.interval}_queued`,
        resource_type: 'event',
        resource_id: args.event_id,
        after: {
          interval: args.interval,
          recipient_count: ids.length,
          subject_en: args.subject_en,
          subject_es: args.subject_es,
          body_en: args.body_en,
          body_es: args.body_es,
        },
      })
      return { ok: true, queued: ids.length }
    },
  },
] satisfies AgentDef['tools']

export const eventReminderAgent: AgentDef = { name: 'event_reminder', system: SYSTEM, tools }

const Ctx = z.object({ trigger: z.enum(['cron', 'manual', 'webhook', 'event']).default('cron') })

export async function run(ctx: unknown = {}) {
  const parsed = Ctx.parse(ctx)
  return runAgent(eventReminderAgent, {
    trigger: parsed.trigger,
    inputSummary: 'Daily event-reminder sweep (7d/1d intervals)',
    initialMessage:
      'Daily reminder sweep. Find events at 7d and 1d windows, get the un-notified RSVPs for each, draft bilingual reminders, and queue them. Skip the 3h window for now (manual handling).',
  })
}
