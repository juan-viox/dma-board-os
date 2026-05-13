import Link from 'next/link'
import Image from 'next/image'
import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import { PROGRAMS } from '@/lib/programs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Six Programs · One Mission',
  description:
    'USMLE Board Prep · Community Health Education · Residency Match Network · Doctor Directory · Annual Gala & CME · Medical Missions to the Dominican Republic.',
}

export default function ProgramsIndexPage() {
  return (
    <PageShell>
      <section className="bg-navy text-cream py-24 md:py-32 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #C8102E 0%, transparent 70%)', opacity: 0.12 }}
        />
        <div className="container-x relative z-10 max-w-4xl">
          <p className="eyebrow text-saffron mb-6"><T en="Programs · Programas" es="Programas · Programs" /></p>
          <h1 className="text-[clamp(40px,7vw,84px)] text-cream text-balance leading-[1.05] mb-8">
            <T
              en={<>One mission, six concrete ways we <em>serve</em>.</>}
              es={<>Una misión, seis formas concretas en que <em>servimos</em>.</>}
            />
          </h1>
          <p className="text-cream/85 text-xl leading-relaxed">
            <T
              en="Each program is open to physicians and community members regardless of nationality. Click any program for details and how to apply, attend, or volunteer."
              es="Cada programa está abierto a médicos y miembros de la comunidad sin importar su nacionalidad."
            />
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="container-x grid md:grid-cols-2 gap-8">
          {PROGRAMS.map((p) => (
            <Link
              key={p.slug}
              href={`/programs/${p.slug}`}
              className="group block bg-parchment border border-stone rounded-md overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.en.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
                <div className="absolute top-6 left-6">
                  <div className="font-display text-saffron text-4xl">{p.num}</div>
                </div>
              </div>
              <div className="p-8">
                <p className="font-accent italic text-saffron mb-2">
                  <T en={p.en.subtitle} es={p.es.subtitle} />
                </p>
                <h2 className="text-2xl text-navy mb-3">
                  <T en={p.en.title} es={p.es.title} />
                </h2>
                <p className="text-ink/80 text-sm leading-relaxed mb-4">
                  <T en={p.en.lede} es={p.es.lede} />
                </p>
                <div className="eyebrow text-crimson group-hover:text-saffron transition-colors">
                  <T en={p.cta.en} es={p.cta.es} /> →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
