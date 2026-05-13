import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events & News',
  description:
    'Monthly Columbia conferences, the annual gala & CME symposium, USMLE cohort kickoffs, community health screenings, and DR mission updates.',
}

const EVENTS = [
  {
    date: '2025-03-26',
    en: { title: 'Surgical Management of Movement Disorders', sub: 'Columbia Neurosurgery + DMA · A Multidisciplinary Approach', body: 'Featured DMA partnership symposium with Dr. Casilda Balmaceda (Columbia Functional Neurosurgery) and Dr. Gordon Baltuch (Columbia Neurosurgery). Topics: Parkinson\'s Disease, Essential Tremor, Alzheimer\'s.' },
    es: { title: 'Manejo Quirúrgico de Trastornos del Movimiento', sub: 'Columbia Neurocirugía + DMA · Un Enfoque Multidisciplinario', body: 'Simposio destacado de DMA con la Dra. Casilda Balmaceda y el Dr. Gordon Baltuch.' },
    badge: { en: 'Past · Featured', es: 'Pasado · Destacado' },
    badgeColor: 'palm',
  },
  {
    date: 'TBD 2026',
    en: { title: 'Annual Gala & CME Symposium', sub: 'Coordinated by Dr. Douglas Mendez', body: 'Black-tie evening at a Manhattan ballroom. CME credit for member physicians. Honorees TBD. Sponsor inquiries: info@dmanewyork.com.' },
    es: { title: 'Gala Anual y Simposio CME', sub: 'Coordinada por el Dr. Douglas Mendez', body: 'Velada de etiqueta. Crédito CME para médicos miembros.' },
    badge: { en: 'Upcoming', es: 'Próximo' },
    badgeColor: 'saffron',
  },
  {
    date: 'Quarterly',
    en: { title: 'USMLE Step 1 Cohort · 12-Week Bilingual Track', sub: 'Members only — open to IMGs of any nationality', body: '12-week DMA mentor pairing + weekly Zoom + WhatsApp accountability + public progress dashboard. Next cohort: contact info@dmanewyork.com.' },
    es: { title: 'Cohorte USMLE Step 1 · 12 Semanas Bilingüe', sub: 'Solo miembros — abierto a IMGs de cualquier nacionalidad', body: 'Mentoría DMA de 12 semanas + Zoom semanal + responsabilidad WhatsApp.' },
    badge: { en: 'Recurring', es: 'Recurrente' },
    badgeColor: 'crimson',
  },
  {
    date: 'TBD',
    en: { title: 'Community Health Fair · Diabetes & Hypertension', sub: 'Co-hosted with Alianza Dominicana · Free + Bilingual', body: 'Free blood pressure + diabetes screenings, bilingual health education, follow-up doctor referrals. Walk-in, all welcome.' },
    es: { title: 'Feria de Salud Comunitaria · Diabetes e Hipertensión', sub: 'Co-organizada con Alianza Dominicana · Gratis y Bilingüe', body: 'Exámenes gratis de presión y diabetes, educación bilingüe, referencias médicas.' },
    badge: { en: 'Upcoming', es: 'Próximo' },
    badgeColor: 'saffron',
  },
] as const

export default function EventsPage() {
  return (
    <PageShell>
      <section className="bg-navy text-cream py-24 md:py-32">
        <div className="container-x max-w-4xl">
          <p className="eyebrow text-saffron mb-6"><T en="Events & News · Eventos y Noticias" es="Eventos y Noticias" /></p>
          <h1 className="text-[clamp(40px,7vw,84px)] text-cream text-balance leading-[1.05] mb-8">
            <T
              en={<>Monthly conferences. Annual <em>gala</em>. Quarterly cohorts. Year-round community health.</>}
              es={<>Conferencias mensuales. <em>Gala</em> anual. Cohortes trimestrales.</>}
            />
          </h1>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="container-x max-w-4xl">
          <ul className="space-y-6">
            {EVENTS.map((e, i) => (
              <li key={i} className="bg-parchment border border-stone rounded-md p-8 md:p-10">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div className={`eyebrow text-[10px] px-3 py-1 rounded-full ${
                    e.badgeColor === 'palm' ? 'bg-palm/10 text-palm border border-palm' :
                    e.badgeColor === 'saffron' ? 'bg-saffron/15 text-navy border border-saffron' :
                    'bg-crimson/10 text-crimson border border-crimson'
                  }`}>
                    <T en={e.badge.en} es={e.badge.es} />
                  </div>
                  <span className="eyebrow text-[10px] text-ink/60">{e.date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl text-navy mb-2">
                  <T en={e.en.title} es={e.es.title} />
                </h2>
                <p className="font-accent italic text-saffron text-lg mb-4">
                  <T en={e.en.sub} es={e.es.sub} />
                </p>
                <p className="text-ink/80 leading-relaxed">
                  <T en={e.en.body} es={e.es.body} />
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  )
}
