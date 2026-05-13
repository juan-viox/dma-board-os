import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { DmaLogo } from '@/components/ui/DmaLogo'
import { getCurrentRole, hasAtLeast } from '@/lib/auth/roles'

const NAV = [
  { href: '/board', label: 'Dashboard', icon: '◉' },
  { href: '/board/members', label: 'Members', icon: '◍' },
  { href: '/board/applications', label: 'Applications', icon: '◐' },
  { href: '/board/directory', label: 'Directory', icon: '◎' },
  { href: '/board/events', label: 'Events', icon: '◌' },
  { href: '/board/donations', label: 'Donations', icon: '◇' },
  { href: '/board/agents', label: 'AI Agents', icon: '◆' },
  { href: '/board/audit', label: 'Audit Log', icon: '◈' },
] as const

export default async function BoardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/board')

  const role = await getCurrentRole()
  const user = await currentUser()
  const isStaff = hasAtLeast(role, 'institution_manager')

  return (
    <div className="min-h-screen bg-cream text-ink flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-dark text-cream/85 flex flex-col fixed inset-y-0 left-0 z-40">
        <Link href="/" className="flex items-center gap-3 p-6 border-b border-cream/10 hover:opacity-80 transition-opacity">
          <DmaLogo className="h-10 w-10 text-saffron" />
          <div>
            <div className="font-display text-saffron text-lg leading-none">VioX AI</div>
            <div className="eyebrow text-[9px] text-cream/60 mt-1">DMA · BOARD OS</div>
          </div>
        </Link>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-eyebrow uppercase tracking-eyebrow text-[11px] hover:bg-cream/5 hover:text-saffron transition-colors"
            >
              <span className="text-saffron text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-cream/10">
          <div className="flex items-center gap-3">
            <UserButton appearance={{ elements: { avatarBox: 'h-10 w-10' } }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-cream truncate">{user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress}</div>
              <div className="eyebrow text-[9px] text-saffron">{role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        {!isStaff && (
          <div className="bg-saffron/15 border-b border-saffron px-8 py-3 text-sm text-navy">
            <strong>Read-only mode:</strong> your role <code className="font-mono px-2 py-0.5 bg-cream rounded">{role}</code> can view but not modify board data. Ask a super_admin to assign you a staff role.
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
