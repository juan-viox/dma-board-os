import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

type Listing = {
  id: string
  member_id: string
  name: string
  specialty: string
  hospital: string | null
  borough: string | null
  languages: string[] | null
  origin: string | null
  insurance: string[] | null
  image_url: string | null
  walking_distance_subway: string | null
  public: boolean
  npi_verified: boolean
  approved_at: string | null
  updated_at: string
}

async function loadListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured) return []
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('directory_listings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500)
  if (error) {
    console.error('[board directory] load error:', error)
    return []
  }
  return (data ?? []) as Listing[]
}

export default async function BoardDirectoryPage() {
  const listings = await loadListings()
  const published = listings.filter((l) => l.public)
  const draft = listings.filter((l) => !l.public)

  return (
    <div className="p-8 lg:p-12 max-w-7xl">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow text-crimson mb-2">Board · Directory</p>
          <h1 className="font-display text-4xl text-navy">Doctor Directory · Public Listings</h1>
          <p className="text-ink/70 mt-1 text-sm">
            {published.length} live · {draft.length} pending review · {listings.length} total
          </p>
        </div>
        <button type="button" className="btn-primary">+ New Listing</button>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-saffron/10 border border-saffron rounded-md p-4 mb-6 text-sm text-navy">
          Supabase not configured — listings unavailable.
        </div>
      )}

      {listings.length === 0 ? (
        <div className="bg-parchment border border-stone rounded-md p-10 text-center text-ink/60">
          <p className="mb-4">No directory listings yet.</p>
          <p className="text-xs">
            Listings populate when board members opt-in via the public application form OR a super_admin
            promotes a member to public via the Members page.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((l) => (
            <article
              key={l.id}
              className={`bg-parchment border rounded-md overflow-hidden transition-shadow hover:shadow-xl ${
                l.public ? 'border-stone' : 'border-saffron'
              }`}
            >
              <div className="relative aspect-[4/3] bg-navy-dark">
                {l.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt={l.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-saffron font-display text-5xl">
                    {l.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span
                    className={`eyebrow text-[9px] px-2 py-0.5 rounded-full border ${
                      l.public
                        ? 'bg-palm/15 text-palm border-palm'
                        : 'bg-saffron/15 text-navy border-saffron'
                    }`}
                  >
                    {l.public ? 'live' : 'draft'}
                  </span>
                  {l.npi_verified && (
                    <span className="eyebrow text-[9px] px-2 py-0.5 rounded-full border bg-cream text-navy border-stone">
                      NPI ✓
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg text-navy mb-1">{l.name}</h3>
                <p className="eyebrow text-crimson text-[10px] mb-2">{l.specialty}</p>
                <p className="font-accent italic text-saffron text-sm mb-3">
                  {l.hospital ?? '—'} {l.borough ? `· ${l.borough}` : ''}
                </p>
                {l.languages && l.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {l.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 bg-cream rounded-full text-[10px] text-navy border border-stone"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
                {l.insurance && l.insurance.length > 0 && (
                  <p className="text-xs text-ink/70 mt-1">
                    Insurance: {l.insurance.slice(0, 3).join(' · ')}
                    {l.insurance.length > 3 ? ` +${l.insurance.length - 3}` : ''}
                  </p>
                )}
                {l.origin && <p className="text-xs text-ink/70 mt-1">Trained in: {l.origin}</p>}
                <div className="flex gap-2 mt-4">
                  <button type="button" className="text-xs px-3 py-1.5 rounded-full font-eyebrow uppercase tracking-eyebrow border border-navy text-navy hover:bg-navy hover:text-cream transition-colors">
                    Edit
                  </button>
                  <button type="button" className="text-xs px-3 py-1.5 rounded-full font-eyebrow uppercase tracking-eyebrow border border-saffron text-navy bg-saffron/10 hover:bg-saffron transition-colors">
                    {l.public ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
