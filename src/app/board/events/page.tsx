import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

type EventRow = {
  id: string
  slug: string
  title_en: string
  title_es: string | null
  subtitle_en: string | null
  start_at: string
  end_at: string | null
  location: string | null
  capacity: number | null
  status: string
  cme_credits: number | null
  is_member_only: boolean
  cover_image_url: string | null
  created_at: string
}

type RsvpCount = { event_id: string; count: number }

async function loadData(): Promise<{ events: EventRow[]; rsvpCounts: Record<string, number> }> {
  if (!isSupabaseConfigured) return { events: [], rsvpCounts: {} }
  const sb = getSupabaseAdmin()
  const [{ data: eventsData }, { data: rsvps }] = await Promise.all([
    sb.from('events').select('*').order('start_at', { ascending: false }).limit(200),
    sb.from('event_rsvps').select('event_id'),
  ])
  const counts: Record<string, number> = {}
  for (const r of (rsvps ?? []) as RsvpCount[]) {
    counts[r.event_id] = (counts[r.event_id] ?? 0) + 1
  }
  return { events: (eventsData ?? []) as EventRow[], rsvpCounts: counts }
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export default async function BoardEventsPage() {
  const { events, rsvpCounts } = await loadData()
  const upcoming = events.filter((e) => new Date(e.start_at) > new Date())
  const past = events.filter((e) => new Date(e.start_at) <= new Date())

  return (
    <div className="p-8 lg:p-12 max-w-6xl">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow text-crimson mb-2">Board · Events</p>
          <h1 className="font-display text-4xl text-navy">Events Calendar</h1>
          <p className="text-ink/70 mt-1 text-sm">
            {upcoming.length} upcoming · {past.length} past · {events.length} total
          </p>
        </div>
        <button type="button" className="btn-primary">+ Create Event</button>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-saffron/10 border border-saffron rounded-md p-4 mb-6 text-sm text-navy">
          Supabase not configured — events unavailable.
        </div>
      )}

      <section className="mb-12">
        <h2 className="font-display text-2xl text-navy mb-5">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="bg-parchment border border-stone rounded-md p-8 text-center text-ink/60">
            No upcoming events. Create one to start.
          </div>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} e={e} rsvpCount={rsvpCounts[e.id] ?? 0} />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-navy mb-5">Past Events</h2>
          <ul className="space-y-3 opacity-80">
            {past.slice(0, 20).map((e) => (
              <EventCard key={e.id} e={e} rsvpCount={rsvpCounts[e.id] ?? 0} compact />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function EventCard({ e, rsvpCount, compact }: { e: EventRow; rsvpCount: number; compact?: boolean }) {
  const statusColor =
    e.status === 'published'
      ? 'bg-palm/15 text-palm border-palm'
      : e.status === 'draft'
      ? 'bg-saffron/15 text-navy border-saffron'
      : e.status === 'cancelled'
      ? 'bg-crimson/10 text-crimson border-crimson'
      : 'bg-stone text-ink border-stone'
  return (
    <li className={`bg-parchment border border-stone rounded-md ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`eyebrow text-[10px] px-2 py-0.5 rounded-full border ${statusColor}`}>
              {e.status}
            </span>
            {e.is_member_only && (
              <span className="eyebrow text-[10px] px-2 py-0.5 rounded-full border bg-saffron/15 text-navy border-saffron">
                members only
              </span>
            )}
            {e.cme_credits ? (
              <span className="eyebrow text-[10px] px-2 py-0.5 rounded-full border bg-cream border-stone text-navy">
                {e.cme_credits} CME
              </span>
            ) : null}
            <span className="text-xs text-ink/60">{fmtDate(e.start_at)}</span>
          </div>
          <h3 className={`text-navy font-display ${compact ? 'text-lg' : 'text-2xl'}`}>{e.title_en}</h3>
          {!compact && e.subtitle_en && (
            <p className="font-accent italic text-saffron text-sm mt-1">{e.subtitle_en}</p>
          )}
          {!compact && e.location && (
            <p className="text-sm text-ink/70 mt-2">📍 {e.location}</p>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="font-display text-2xl text-navy">{rsvpCount}</div>
            <div className="eyebrow text-[10px] text-crimson">RSVPs</div>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="text-[10px] px-3 py-1.5 rounded-full font-eyebrow uppercase tracking-eyebrow border border-navy text-navy hover:bg-navy hover:text-cream transition-colors">
              Edit
            </button>
            {e.status === 'draft' ? (
              <button type="button" className="text-[10px] px-3 py-1.5 rounded-full font-eyebrow uppercase tracking-eyebrow bg-saffron text-navy hover:bg-saffron-soft transition-colors">
                Publish
              </button>
            ) : (
              <button type="button" className="text-[10px] px-3 py-1.5 rounded-full font-eyebrow uppercase tracking-eyebrow border border-stone text-ink hover:bg-stone transition-colors">
                Roster
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
