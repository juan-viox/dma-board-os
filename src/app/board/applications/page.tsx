import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { ApplicationActions } from './ApplicationActions'

type AppRow = {
  id: string
  full_name: string
  email: string
  country_of_training: string
  npi: string | null
  specialty: string
  hospital_affiliation: string | null
  tier: string
  motivation: string
  status: string
  triage_memo: string | null
  triage_score: number | null
  triage_red_flags: string[]
  created_at: string
}

async function loadApplications(): Promise<AppRow[]> {
  if (!isSupabaseConfigured) return []
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('applications')
    .select('id, full_name, email, country_of_training, npi, specialty, hospital_affiliation, tier, motivation, status, triage_memo, triage_score, triage_red_flags, created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    console.error('[board apps] load error:', error)
    return []
  }
  return (data ?? []) as AppRow[]
}

export default async function ApplicationsPage() {
  const apps = await loadApplications()
  const queue = apps.filter((a) => ['submitted', 'triaged', 'board_review'].includes(a.status))
  const decided = apps.filter((a) => ['approved', 'rejected', 'duplicate'].includes(a.status))

  return (
    <div className="p-8 lg:p-12 max-w-6xl">
      <header className="mb-8">
        <p className="eyebrow text-crimson mb-2">Board · Applications</p>
        <h1 className="font-display text-4xl text-navy">Membership Applications</h1>
        <p className="text-ink/70 mt-1 text-sm">{queue.length} pending review · {decided.length} decided</p>
      </header>

      <section className="mb-12">
        <h2 className="font-display text-2xl text-navy mb-4">Pending Review</h2>
        {queue.length === 0 && (
          <div className="bg-parchment border border-stone rounded-md p-8 text-center text-ink/60">No pending applications.</div>
        )}
        <ul className="space-y-4">
          {queue.map((app) => (
            <li key={app.id} className="bg-parchment border border-stone rounded-md p-6">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h3 className="font-display text-xl text-navy">{app.full_name}</h3>
                  <p className="text-sm text-ink/70">
                    {app.email} · {app.specialty} · {app.country_of_training}
                  </p>
                  <p className="text-xs text-ink/50 mt-1">
                    Submitted {new Date(app.created_at).toLocaleString()} · Tier: {app.tier}
                    {app.npi && ` · NPI ${app.npi}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {typeof app.triage_score === 'number' && (
                    <span className={`eyebrow text-[10px] px-3 py-1 rounded-full border ${
                      app.triage_score >= 7 ? 'bg-palm/15 text-palm border-palm' :
                      app.triage_score >= 4 ? 'bg-saffron/15 text-navy border-saffron' :
                      'bg-crimson/10 text-crimson border-crimson'
                    }`}>
                      Triage {app.triage_score.toFixed(1)}/10
                    </span>
                  )}
                  <span className={`eyebrow text-[10px] px-3 py-1 rounded-full border ${
                    app.status === 'submitted' ? 'bg-stone text-ink border-stone' :
                    app.status === 'triaged' ? 'bg-saffron/15 text-navy border-saffron' :
                    'bg-palm/15 text-palm border-palm'
                  }`}>{app.status}</span>
                </div>
              </div>

              {app.triage_red_flags?.length > 0 && (
                <div className="mb-3 p-3 bg-crimson/10 border border-crimson rounded-md">
                  <p className="eyebrow text-crimson text-[10px] mb-1">Red Flags</p>
                  <ul className="list-disc list-inside text-sm text-crimson space-y-0.5">
                    {app.triage_red_flags.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              {app.triage_memo && (
                <details className="mb-3">
                  <summary className="cursor-pointer eyebrow text-crimson text-[10px] hover:text-saffron">
                    Triage Memo (drafted by Claude)
                  </summary>
                  <div className="mt-2 p-4 bg-cream rounded-md text-sm text-ink/85 whitespace-pre-wrap">{app.triage_memo}</div>
                </details>
              )}

              <details>
                <summary className="cursor-pointer eyebrow text-crimson text-[10px] hover:text-saffron">
                  Applicant Motivation
                </summary>
                <p className="mt-2 p-4 bg-cream rounded-md text-sm text-ink/85 italic">&ldquo;{app.motivation}&rdquo;</p>
              </details>

              <div className="mt-4">
                <ApplicationActions applicationId={app.id} status={app.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-navy mb-4">Recent Decisions</h2>
          <div className="bg-parchment border border-stone rounded-md p-6 text-sm">
            {decided.slice(0, 10).map((app) => (
              <div key={app.id} className="flex items-center justify-between border-b border-stone last:border-b-0 py-2">
                <span className="text-navy">{app.full_name} <span className="text-ink/50">· {app.specialty}</span></span>
                <span className={`eyebrow text-[10px] ${app.status === 'approved' ? 'text-palm' : 'text-crimson'}`}>{app.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
