import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server'
import { AddMemberDialog } from './AddMemberDialog'

type MemberRow = {
  id: string
  full_name: string
  email: string
  member_tier: string
  specialty: string | null
  hospital_affiliation: string | null
  country_of_training: string | null
  dues_status: string
  dues_expires_at: string | null
  npi: string | null
  npi_verification_status: string
  member_since: string
}

async function loadMembers(): Promise<MemberRow[]> {
  if (!isSupabaseConfigured) return []
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('members')
    .select('id, full_name, email, member_tier, specialty, hospital_affiliation, country_of_training, dues_status, dues_expires_at, npi, npi_verification_status, member_since')
    .order('member_since', { ascending: false })
    .limit(500)
  if (error) {
    console.error('[board members] load error:', error)
    return []
  }
  return (data ?? []) as MemberRow[]
}

export default async function MembersPage() {
  const members = await loadMembers()
  return (
    <div className="p-8 lg:p-12 max-w-7xl">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow text-crimson mb-2">Board · Members</p>
          <h1 className="font-display text-4xl text-navy">Members</h1>
          <p className="text-ink/70 mt-1 text-sm">{members.length} active records · click any row to edit</p>
        </div>
        <AddMemberDialog />
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-saffron/10 border border-saffron rounded-md p-4 mb-6 text-sm text-navy">
          Supabase not configured — table is empty. Once env vars + migrations are in, members will appear here.
        </div>
      )}

      <div className="bg-parchment border border-stone rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy text-cream/85">
            <tr className="text-left">
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Name</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Tier</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Specialty</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Hospital</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Origin</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">NPI</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Dues</th>
              <th className="px-4 py-3 font-eyebrow uppercase tracking-eyebrow text-[10px]">Member Since</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-ink/50">
                  No members yet. Members are added via approved applications, manual import, or board action.
                </td>
              </tr>
            )}
            {members.map((m) => (
              <tr key={m.id} className="border-t border-stone hover:bg-cream cursor-pointer">
                <td className="px-4 py-3">
                  <div className="font-medium text-navy">{m.full_name}</div>
                  <div className="text-xs text-ink/60">{m.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`eyebrow text-[10px] px-2 py-0.5 rounded-full ${
                    m.member_tier === 'sponsor' ? 'bg-saffron/20 text-navy border border-saffron' :
                    m.member_tier === 'active' ? 'bg-palm/15 text-palm border border-palm' :
                    'bg-stone text-ink border-stone'
                  }`}>{m.member_tier}</span>
                </td>
                <td className="px-4 py-3 text-ink">{m.specialty ?? '—'}</td>
                <td className="px-4 py-3 text-ink">{m.hospital_affiliation ?? '—'}</td>
                <td className="px-4 py-3 text-ink">{m.country_of_training ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {m.npi ?? '—'}
                  {m.npi && (
                    <span className={`ml-2 eyebrow text-[9px] ${m.npi_verification_status === 'verified' ? 'text-palm' : m.npi_verification_status === 'revoked' ? 'text-crimson' : 'text-ink/50'}`}>
                      {m.npi_verification_status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`eyebrow text-[10px] px-2 py-0.5 rounded-full ${
                    m.dues_status === 'active' ? 'bg-palm/15 text-palm border border-palm' :
                    m.dues_status === 'grace' ? 'bg-saffron/15 text-navy border border-saffron' :
                    m.dues_status === 'expired' ? 'bg-crimson/10 text-crimson border border-crimson' :
                    'bg-stone text-ink border-stone'
                  }`}>{m.dues_status}</span>
                  {m.dues_expires_at && <div className="text-xs text-ink/60 mt-1">exp {m.dues_expires_at}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-ink/70">{m.member_since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
