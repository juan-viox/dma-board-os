import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

type AuditRow = {
  id: number
  at: string
  actor_type: string
  actor_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  ip_address: string | null
}

async function loadAudit(): Promise<AuditRow[]> {
  if (!isSupabaseConfigured) return []
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('audit_log')
    .select('*')
    .order('at', { ascending: false })
    .limit(200)
  if (error) {
    console.error('[board audit] load error:', error)
    return []
  }
  return (data ?? []) as AuditRow[]
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' })

export default async function BoardAuditPage() {
  const rows = await loadAudit()

  return (
    <div className="p-8 lg:p-12 max-w-6xl">
      <header className="mb-8">
        <p className="eyebrow text-crimson mb-2">Board · Audit Log</p>
        <h1 className="font-display text-4xl text-navy">Audit Log</h1>
        <p className="text-ink/70 mt-1 text-sm">
          Append-only log of every state change made by humans, agents, webhooks, and system jobs.
          Showing the last {rows.length} entries.
        </p>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-saffron/10 border border-saffron rounded-md p-4 mb-6 text-sm text-navy">
          Supabase not configured — audit unavailable.
        </div>
      )}

      <div className="bg-parchment border border-stone rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy text-cream/85">
            <tr className="text-left">
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">When</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Actor</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Action</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Resource</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink/50">
                  No audit entries yet. Every CRUD action, agent run, and webhook is recorded here.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-stone hover:bg-cream align-top">
                <td className="px-4 py-3 text-xs text-ink/70 whitespace-nowrap">{fmt(r.at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`eyebrow text-[10px] px-2 py-0.5 rounded-full border ${
                        r.actor_type === 'agent'
                          ? 'bg-saffron/15 text-navy border-saffron'
                          : r.actor_type === 'user'
                          ? 'bg-palm/15 text-palm border-palm'
                          : r.actor_type === 'webhook'
                          ? 'bg-cream border-stone text-navy'
                          : 'bg-stone text-ink border-stone'
                      }`}
                    >
                      {r.actor_type}
                    </span>
                    {r.actor_id && (
                      <span className="text-xs text-ink/70 font-mono truncate max-w-[12rem]">
                        {r.actor_id}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="font-mono text-xs text-navy bg-cream px-2 py-0.5 rounded border border-stone">
                    {r.action}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="text-navy text-xs">{r.resource_type}</div>
                  {r.resource_id && (
                    <div className="text-[10px] text-ink/50 font-mono truncate max-w-[10rem]">
                      {r.resource_id}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 max-w-md">
                  {r.after ? (
                    <details>
                      <summary className="cursor-pointer eyebrow text-crimson text-[10px] hover:text-saffron">
                        Show payload
                      </summary>
                      <pre className="mt-2 p-3 bg-cream rounded-md text-[10px] text-ink/80 overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(r.after, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <span className="text-ink/40 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
