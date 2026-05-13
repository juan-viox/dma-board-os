'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dma-lang'

export function LangToggle({ inverted = false }: { inverted?: boolean }) {
  const [lang, setLang] = useState<'en' | 'es'>('en')

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as 'en' | 'es' | null
    if (stored === 'en' || stored === 'es') {
      setLang(stored)
      document.documentElement.dataset.lang = stored
    } else {
      // First-visit: detect Spanish locale, default to English otherwise
      const navLang = (navigator.language || 'en').toLowerCase()
      const initial = navLang.startsWith('es') ? 'es' : 'en'
      setLang(initial)
      document.documentElement.dataset.lang = initial
    }
  }, [])

  function pick(next: 'en' | 'es') {
    setLang(next)
    document.documentElement.dataset.lang = next
    localStorage.setItem(STORAGE_KEY, next)
  }

  const baseStyles = inverted
    ? 'border border-navy/20 bg-cream/95 text-navy'
    : 'border border-cream/30 bg-saffron text-navy'

  return (
    <div
      className={`inline-flex items-center rounded-full ${baseStyles} font-eyebrow text-[11px] tracking-eyebrow uppercase select-none`}
      role="group"
      aria-label="Language toggle"
    >
      <button
        type="button"
        onClick={() => pick('en')}
        className={`px-4 py-2 rounded-full transition-all ${
          lang === 'en' ? 'bg-saffron text-navy' : 'opacity-60 hover:opacity-100'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => pick('es')}
        className={`px-4 py-2 rounded-full transition-all ${
          lang === 'es' ? 'bg-saffron text-navy' : 'opacity-60 hover:opacity-100'
        }`}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
    </div>
  )
}
