import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'

type DonationRow = {
  id: string
  donor_email: string
  donor_name: string | null
  amount_cents: number
  currency: string
  intent: string | null
  stripe_payment_intent_id: string | null
  receipt_sent_at: string | null
  thank_you_drafted_at: string | null
  thank_you_drafted_by_agent: boolean | null
  thank_you_sent_at: string | null
  receipt_pdf_url: string | null
  created_at: string
}

async function loadDonations(): Promise<DonationRow[]> {
  if (!isSupabaseConfigured) return []
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) {
    console.error('[board donations] load error:', error)
    return []
  }
  return (data ?? []) as DonationRow[]
}

const fmtMoney = (cents: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100)

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : '—')

export default async function BoardDonationsPage() {
  const donations = await loadDonations()
  const ytd = donations.filter((d) => new Date(d.created_at).getFullYear() === new Date().getFullYear())
  const mtd = donations.filter(
    (d) =>
      new Date(d.created_at).getFullYear() === new Date().getFullYear() &&
      new Date(d.created_at).getMonth() === new Date().getMonth()
  )
  const totalYtd = ytd.reduce((s, d) => s + d.amount_cents, 0)
  const totalMtd = mtd.reduce((s, d) => s + d.amount_cents, 0)
  const totalAll = donations.reduce((s, d) => s + d.amount_cents, 0)
  const pendingAck = donations.filter((d) => !d.thank_you_sent_at).length
  const pendingReceipt = donations.filter((d) => !d.receipt_sent_at).length

  return (
    <div className="p-8 lg:p-12 max-w-7xl">
      <header className="mb-8">
        <p className="eyebrow text-crimson mb-2">Board · Donations</p>
        <h1 className="font-display text-4xl text-navy">Donations Ledger</h1>
        <p className="text-ink/70 mt-1 text-sm">
          Stripe-synced. The Donation Acknowledgment Agent drafts thank-you notes (auto-send under $1,000;
          board approves above).
        </p>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-saffron/10 border border-saffron rounded-md p-4 mb-6 text-sm text-navy">
          Supabase not configured — donations unavailable.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <Stat label="Donations MTD" value={fmtMoney(totalMtd)} />
        <Stat label="Donations YTD" value={fmtMoney(totalYtd)} />
        <Stat label="Lifetime Total" value={fmtMoney(totalAll)} />
        <Stat label="Pending Thank-You" value={`${pendingAck}`} tone={pendingAck > 0 ? 'warn' : 'ok'} />
      </div>

      {pendingReceipt > 0 && (
        <div className="bg-saffron/10 border border-saffron rounded-md p-4 mb-6 text-sm text-navy">
          <strong>{pendingReceipt}</strong> donation{pendingReceipt === 1 ? '' : 's'} need{' '}
          {pendingReceipt === 1 ? 's' : ''} a tax receipt. Click any row to generate.
        </div>
      )}

      <div className="bg-parchment border border-stone rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy text-cream/85">
            <tr className="text-left">
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Donor</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Amount</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Intent</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Date</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Receipt</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Thank-You</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Stripe</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink/50">
                  No donations yet. Stripe webhook → /api/webhooks/stripe will populate this ledger
                  automatically (next phase).
                </td>
              </tr>
            )}
            {donations.map((d) => {
              const isLarge = d.amount_cents >= 100000
              return (
                <tr key={d.id} className="border-t border-stone hover:bg-cream cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">{d.donor_name ?? '—'}</div>
                    <div className="text-xs text-ink/60">{d.donor_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-display text-lg ${isLarge ? 'text-crimson' : 'text-navy'}`}>
                      {fmtMoney(d.amount_cents, d.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/85 text-xs">{d.intent ?? 'general'}</td>
                  <td className="px-4 py-3 text-xs text-ink/70">{fmtDate(d.created_at)}</td>
                  <td className="px-4 py-3">
                    {d.receipt_sent_at ? (
                      <span className="eyebrow text-[10px] text-palm">sent</span>
                    ) : (
                      <span className="eyebrow text-[10px] text-saffron">pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {d.thank_you_sent_at ? (
                      <span className="eyebrow text-[10px] text-palm">sent</span>
                    ) : d.thank_you_drafted_at ? (
                      <span className="eyebrow text-[10px] text-saffron">
                        draft{isLarge ? ' · needs board' : ''}
                      </span>
                    ) : (
                      <span className="eyebrow text-[10px] text-ink/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-ink/50 truncate max-w-[8rem]">
                    {d.stripe_payment_intent_id ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Stat({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'ok' | 'warn' }) {
  const accentBorder = tone === 'warn' ? 'border-saffron' : tone === 'ok' ? 'border-palm' : 'border-stone'
  return (
    <div className={`bg-parchment border ${accentBorder} rounded-md p-5`}>
      <div className="eyebrow text-[10px] text-crimson mb-2">{label}</div>
      <div className="font-display text-3xl text-navy">{value}</div>
    </div>
  )
}
