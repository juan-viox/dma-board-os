/**
 * Vercel Cron entrypoint for scheduled agents.
 *
 * Vercel cron config (in vercel.json) calls this endpoint with the schedule.
 * The `agent` query param routes to the right agent. Protected by CRON_SECRET.
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const agent = url.searchParams.get('agent')
  if (!agent) return NextResponse.json({ error: 'agent query param required' }, { status: 400 })

  // Whitelist
  const ALLOWED = new Set([
    'membership_renewal',
    'npi_verification',
    'newsletter_drafter',
    'voice_agent_analyst',
    'event_reminder',
  ])
  if (!ALLOWED.has(agent)) {
    return NextResponse.json({ error: `Unknown agent: ${agent}` }, { status: 400 })
  }

  try {
    const mod = await import(`@/lib/agents/${agent.replace(/_/g, '-')}`)
    if (typeof mod.run !== 'function') {
      return NextResponse.json({ error: `Agent ${agent} has no run()` }, { status: 500 })
    }
    const result = await mod.run({ trigger: 'cron' })
    return NextResponse.json({ ok: true, agent, result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, agent, error: message }, { status: 500 })
  }
}
