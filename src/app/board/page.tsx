import Link from 'next/link'
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

async function loadStats() {
  if (!isSupabaseConfigured) {
    return {
      members: 0,
      pendingApplications: 0,
      duesExpiring30d: 0,
      eventsUpcoming: 0,
      donationsMtdCents: 0,
      agentRunsToday: 0,
      configured: false,
    }
  }
  const sb = getSupabaseAdmin()
  const [{ count: members }, { count: pendingApps }, { count: events }, { data: agentRunsRaw }, { data: dues }, { data: donations }] = await Promise.all([
    sb.from('members').select('*', { count: 'exact', head: true }),
    sb.from('applications').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'triaged', 'board_review']),
    sb.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    sb.from('agent_runs').select('id, started_at').gte('started_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    sb.from('members').select('id, dues_expires_at').lte('dues_expires_at', new Date(Date.now() + 30 * 86400e3).toISOString().slice(0, 10)).gte('dues_expires_at', new Date().toISOString().slice(0, 10)),
    sb.from('donations').select('amount_cents').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])
  return {
    members: members ?? 0,
    pendingApplications: pendingApps ?? 0,
    eventsUpcoming: events ?? 0,
    duesExpiring30d: dues?.length ?? 0,
    donationsMtdCents: (donations ?? []).reduce((s: number, d: { amount_cents: number }) => s + (d.amount_cents ?? 0), 0),
    agentRunsToday: agentRunsRaw?.length ?? 0,
    configured: true,
  }
}

export default async function BoardDashboard() {
  const s = await loadStats()
  return (
    <div className="p-8 lg:p-12 max-w-7xl">
      <div className="mb-12">
        <p className="eyebrow text-crimson mb-2">VioX AI · DMA Board OS</p>
        <h1 className="font-display text-5xl text-navy">Dashboard</h1>
        <p className="text-ink/70 mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {!s.configured && (
        <div className="bg-saffron/10 border border-saffron rounded-md p-6 mb-10">
          <p className="eyebrow text-crimson text-[10px] mb-2">Setup Required</p>
          <p className="text-navy">
            Supabase is not yet configured. Add <code className="font-mono px-1.5 py-0.5 bg-cream rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono px-1.5 py-0.5 bg-cream rounded">SUPABASE_SERVICE_ROLE_KEY</code> to the Vercel project, then run the SQL migrations from <code className="font-mono px-1.5 py-0.5 bg-cream rounded">supabase/migrations/</code> in the Supabase SQL editor.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Stat label="Total Members" value={s.members.toLocaleString()} href="/board/members" />
        <Stat label="Pending Applications" value={String(s.pendingApplications)} href="/board/applications" tone={s.pendingApplications > 0 ? 'warn' : 'ok'} />
        <Stat label="Dues Expiring 30d" value={String(s.duesExpiring30d)} href="/board/members?filter=expiring" />
        <Stat label="Upcoming Events" value={String(s.eventsUpcoming)} href="/board/events" />
        <Stat label="Donations MTD" value={`$${(s.donationsMtdCents / 100).toLocaleString()}`} href="/board/donations" />
        <Stat label="Agent Runs Today" value={String(s.agentRunsToday)} href="/board/agents" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Quick Actions" eyebrow="What to do next">
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/board/applications" className="flex items-center gap-3 p-3 rounded-md hover:bg-parchment border border-stone">
                <span className="text-saffron">→</span>
                <div>
                  <div className="text-navy font-medium">Review pending applications</div>
                  <div className="text-ink/60 text-xs">Application Triage Agent has drafted board memos</div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/board/agents" className="flex items-center gap-3 p-3 rounded-md hover:bg-parchment border border-stone">
                <span className="text-saffron">→</span>
                <div>
                  <div className="text-navy font-medium">Run an agent manually</div>
                  <div className="text-ink/60 text-xs">8 agents available — scheduled or on-demand</div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/board/members?action=add" className="flex items-center gap-3 p-3 rounded-md hover:bg-parchment border border-stone">
                <span className="text-saffron">→</span>
                <div>
                  <div className="text-navy font-medium">Add a member manually</div>
                  <div className="text-ink/60 text-xs">For physicians who joined offline</div>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/board/events?action=new" className="flex items-center gap-3 p-3 rounded-md hover:bg-parchment border border-stone">
                <span className="text-saffron">→</span>
                <div>
                  <div className="text-navy font-medium">Create a new event</div>
                  <div className="text-ink/60 text-xs">Event Reminder Agent will handle the timing</div>
                </div>
              </Link>
            </li>
          </ul>
        </Panel>

        <Panel title="Active AI Agents" eyebrow="Automation">
          <div className="space-y-3 text-sm">
            <AgentCard name="Membership Renewal" desc="Daily 9 AM ET — drafts bilingual renewal emails 30/14/7d before expiry" status="scheduled" />
            <AgentCard name="Application Triage" desc="On every new application — verifies NPI, scores fit, drafts board memo" status="event" />
            <AgentCard name="NPI Verification" desc="Monthly — re-checks every member NPI against CMS NPPES" status="scheduled" />
            <AgentCard name="Newsletter Drafter" desc="1st & 15th — bilingual ¡Escucha Esto! draft" status="scheduled" />
            <AgentCard name="Voice Agent Analyst" desc="Daily 12 PM ET — reviews Dr. Asistente transcripts" status="scheduled" />
            <AgentCard name="Donation Acknowledgment" desc="Stripe webhook — drafts thank-you, auto-sends < $1K" status="event" />
            <AgentCard name="Event Reminder" desc="Daily — bilingual SMS+email 7d/1d/3hr before events" status="scheduled" />
            <AgentCard name="Mission Trip Coordinator" desc="On-demand — builds DR mission roster" status="manual" />
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Stat({ label, value, href, tone = 'neutral' }: { label: string; value: string; href: string; tone?: 'neutral' | 'ok' | 'warn' }) {
  const accentBorder =
    tone === 'warn' ? 'border-saffron' : tone === 'ok' ? 'border-palm' : 'border-stone'
  return (
    <Link
      href={href}
      className={`block bg-parchment border ${accentBorder} rounded-md p-5 hover:-translate-y-0.5 transition-transform`}
    >
      <div className="eyebrow text-[10px] text-crimson mb-2">{label}</div>
      <div className="font-display text-3xl text-navy">{value}</div>
    </Link>
  )
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="bg-parchment border border-stone rounded-md p-7">
      <p className="eyebrow text-crimson text-[10px] mb-2">{eyebrow}</p>
      <h2 className="font-display text-2xl text-navy mb-5">{title}</h2>
      {children}
    </section>
  )
}

function AgentCard({ name, desc, status }: { name: string; desc: string; status: 'scheduled' | 'event' | 'manual' }) {
  const statusColor =
    status === 'scheduled' ? 'bg-palm/15 text-palm border-palm' :
    status === 'event' ? 'bg-saffron/15 text-navy border-saffron' :
    'bg-stone text-ink border-stone'
  return (
    <div className="flex items-start gap-3 p-3 border border-stone rounded-md bg-cream">
      <span className="text-saffron mt-0.5">◆</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-navy text-sm">{name}</span>
          <span className={`eyebrow text-[9px] px-2 py-0.5 rounded-full border ${statusColor}`}>{status}</span>
        </div>
        <p className="text-xs text-ink/60 mt-1">{desc}</p>
      </div>
    </div>
  )
}
