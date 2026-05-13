import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { AgentRunButton, AgentToggle } from './AgentControls'

type AgentConfig = {
  name: string
  display_name: string
  description: string | null
  enabled: boolean
  schedule_cron: string | null
  monthly_token_budget: number
  tokens_used_this_month: number
  approval_threshold_cents: number | null
  last_run_at: string | null
  next_run_at: string | null
}

type RunRow = {
  id: string
  agent_name: string
  trigger: string
  started_at: string
  finished_at: string | null
  status: string
  output_summary: string | null
  tokens_input: number | null
  tokens_output: number | null
  cost_usd: number | null
  error_message: string | null
}

async function loadData(): Promise<{ agents: AgentConfig[]; runs: RunRow[] }> {
  if (!isSupabaseConfigured) return { agents: [], runs: [] }
  const sb = getSupabaseAdmin()
  const [{ data: agents }, { data: runs }] = await Promise.all([
    sb.from('agent_configs').select('*').order('display_name'),
    sb.from('agent_runs').select('*').order('started_at', { ascending: false }).limit(20),
  ])
  return { agents: (agents ?? []) as AgentConfig[], runs: (runs ?? []) as RunRow[] }
}

export default async function AgentsPage() {
  const { agents, runs } = await loadData()

  return (
    <div className="p-8 lg:p-12 max-w-7xl">
      <header className="mb-8">
        <p className="eyebrow text-crimson mb-2">Board · AI Agents</p>
        <h1 className="font-display text-4xl text-navy">VioX AI Agents</h1>
        <p className="text-ink/70 mt-1 text-sm">
          Each agent is a Claude Sonnet instance with tool-use, a monthly token budget, and an audit trail. Cron-scheduled or event-triggered.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-display text-2xl text-navy mb-5">Agent Catalog</h2>
        <div className="grid lg:grid-cols-2 gap-5">
          {agents.length === 0 && (
            <div className="bg-saffron/10 border border-saffron rounded-md p-6 text-sm text-navy col-span-2">
              No agents loaded yet. Once Supabase is configured, the seed data in <code className="font-mono px-1 bg-cream rounded">0001_initial.sql</code> will populate this list with the 8 default agents.
            </div>
          )}
          {agents.map((a) => {
            const utilPct = (a.tokens_used_this_month / a.monthly_token_budget) * 100
            return (
              <div key={a.name} className="bg-parchment border border-stone rounded-md p-6">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <h3 className="font-display text-xl text-navy">{a.display_name}</h3>
                    <code className="text-[10px] text-ink/50 font-mono">{a.name}</code>
                  </div>
                  <AgentToggle name={a.name} enabled={a.enabled} />
                </div>
                <p className="text-sm text-ink/75 leading-relaxed mb-4">{a.description}</p>

                <div className="space-y-2 text-xs text-ink/70 mb-4">
                  {a.schedule_cron && (
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-crimson text-[10px]">Schedule</span>
                      <code className="font-mono text-navy">{a.schedule_cron}</code>
                    </div>
                  )}
                  {!a.schedule_cron && (
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-crimson text-[10px]">Trigger</span>
                      <span className="text-navy">on event / manual</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-crimson text-[10px]">Last Run</span>
                    <span className="text-navy">{a.last_run_at ? new Date(a.last_run_at).toLocaleString() : '—'}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-[10px] eyebrow text-crimson mb-1">
                    <span>Token Budget</span>
                    <span className="text-navy font-mono">{a.tokens_used_this_month.toLocaleString()} / {a.monthly_token_budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone rounded-full overflow-hidden">
                    <div
                      className={`h-full ${utilPct > 80 ? 'bg-crimson' : utilPct > 50 ? 'bg-saffron' : 'bg-palm'}`}
                      style={{ width: `${Math.min(utilPct, 100)}%` }}
                    />
                  </div>
                </div>

                <AgentRunButton name={a.name} disabled={!a.enabled} />
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-navy mb-5">Recent Runs</h2>
        <div className="bg-parchment border border-stone rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy text-cream/85">
              <tr className="text-left">
                <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Agent</th>
                <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Trigger</th>
                <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Started</th>
                <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Status</th>
                <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Tokens</th>
                <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Cost</th>
                <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Output</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink/50">No agent runs yet.</td>
                </tr>
              )}
              {runs.map((r) => (
                <tr key={r.id} className="border-t border-stone hover:bg-cream">
                  <td className="px-4 py-3 font-mono text-xs text-navy">{r.agent_name}</td>
                  <td className="px-4 py-3 text-ink/70">{r.trigger}</td>
                  <td className="px-4 py-3 text-xs text-ink/70">{new Date(r.started_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`eyebrow text-[10px] px-2 py-0.5 rounded-full border ${
                      r.status === 'succeeded' ? 'bg-palm/15 text-palm border-palm' :
                      r.status === 'running' ? 'bg-saffron/15 text-navy border-saffron' :
                      'bg-crimson/10 text-crimson border-crimson'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/70 font-mono">
                    {r.tokens_input ?? 0}/{r.tokens_output ?? 0}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/70">${(r.cost_usd ?? 0).toFixed(4)}</td>
                  <td className="px-4 py-3 text-xs text-ink/70 max-w-md truncate">
                    {r.output_summary ?? r.error_message ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
