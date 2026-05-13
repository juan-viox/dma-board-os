'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { DmaLogo } from '@/components/ui/DmaLogo'
import { LangToggle } from '@/components/i18n/LangToggle'
import { T } from '@/components/i18n/T'

const NAV_ITEMS = [
  { href: '/about', en: 'About', es: 'Conócenos' },
  { href: '/programs', en: 'Programs', es: 'Programas' },
  { href: '/directory', en: 'Find a Doctor', es: 'Encuentra un Médico' },
  { href: '/events', en: 'Events', es: 'Eventos' },
  { href: '/get-involved', en: 'Get Involved', es: 'Participa' },
] as const

export function Navbar({ heroMode = false }: { heroMode?: boolean }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!heroMode) {
      setScrolled(true)
      return
    }
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [heroMode])

  const isTransparent = heroMode && !scrolled
  const navColor = isTransparent ? 'text-cream' : 'text-navy'
  const bg = isTransparent
    ? 'bg-transparent'
    : 'bg-cream/95 backdrop-blur-md shadow-sm border-b border-stone/40'

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${bg} ${navColor}`}
      aria-label="Primary navigation"
    >
      <div className="container-x flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <DmaLogo className={`transition-all ${isTransparent ? 'h-16 w-16' : 'h-12 w-12'} ${isTransparent ? 'text-saffron' : 'text-navy'}`} />
          <span className="sr-only">DMA — Dominican Medical Association</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-eyebrow uppercase tracking-eyebrow text-[11px] transition-colors hover:text-saffron ${
                  active ? 'text-saffron' : ''
                }`}
              >
                <T en={item.en} es={item.es} />
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <LangToggle inverted={!isTransparent} />
          <SignedIn>
            <Link
              href="/board"
              className="hidden md:inline-flex font-eyebrow uppercase tracking-eyebrow text-[10px] px-3 py-2 rounded-full border border-current/30 hover:text-saffron transition-colors"
            >
              <T en="Board" es="Junta" />
            </Link>
            <UserButton appearance={{ elements: { avatarBox: 'h-9 w-9' } }} />
          </SignedIn>
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden md:inline-flex font-eyebrow uppercase tracking-eyebrow text-[10px] px-4 py-2 rounded-full bg-navy text-cream hover:bg-crimson transition-colors"
            >
              <T en="Sign In" es="Acceso" />
            </Link>
          </SignedOut>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="lg:hidden p-2 rounded-md hover:bg-current/10 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div className="lg:hidden bg-cream border-t border-stone/40 text-navy">
          <div className="container-x py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-eyebrow uppercase tracking-eyebrow text-xs py-3 hover:text-saffron transition-colors border-b border-stone/40 last:border-b-0"
              >
                <T en={item.en} es={item.es} />
              </Link>
            ))}
            <SignedOut>
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center font-eyebrow uppercase tracking-eyebrow text-[11px] px-5 py-3 rounded-full bg-navy text-cream"
              >
                <T en="Sign In" es="Acceso" />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/board"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center font-eyebrow uppercase tracking-eyebrow text-[11px] px-5 py-3 rounded-full bg-navy text-cream"
              >
                <T en="Open Board" es="Abrir Junta" />
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  )
}
