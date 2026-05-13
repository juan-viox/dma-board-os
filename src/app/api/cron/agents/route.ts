/**
 * Vercel Cron entrypoint for scheduled agents.
 *
 * Vercel cron config (in vercel.json) calls this endpoint with the schedule.
 * The `agent` query param routes to the right agent. Protected by CRON_SECRET.
 */
import { NextRequest, NextResponse } from 'next/server'
import { triggerAgent } from '@/lib/agents/runtime'

export const runtime = 'nodejs'
export const maxDuration = 300

const ALLOWED = new Set([
  'membership_renewal',
  'npi_verification',
  'newsletter_drafter',
  'voice_agent_analyst',
  'event_reminder',
])

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const agent = url.searchParams.get('agent')
  if (!agent) return NextResponse.json({ error: 'agent query param required' }, { status: 400 })
  if (!ALLOWED.has(agent)) {
    return NextResponse.json({ error: `Unknown or non-cron agent: ${agent}` }, { status: 400 })
  }

  try {
    const result = await triggerAgent(agent, { trigger: 'cron' })
    return NextResponse.json({ ok: true, agent, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, agent, error: message }, { status: 500 })
  }
}
