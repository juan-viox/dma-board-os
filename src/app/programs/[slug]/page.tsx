import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import { PROGRAMS } from '@/lib/programs'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = PROGRAMS.find((x) => x.slug === slug)
  if (!p) return {}
  return {
    title: p.en.title,
    description: p.en.lede,
    openGraph: { images: [p.image] },
  }
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = PROGRAMS.find((x) => x.slug === slug)
  if (!p) notFound()

  return (
    <PageShell>
      <section className="relative bg-navy-dark text-cream min-h-[60vh] flex items-end overflow-hidden">
        <Image src={p.image} alt={p.en.title} fill className="object-cover opacity-40" priority />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(11,42,74,0.55) 0%, rgba(11,42,74,0.92) 100%)' }}
        />
        <div className="container-x relative z-10 py-24">
          <Link href="/programs" className="eyebrow text-saffron hover:text-cream transition-colors">
            ← <T en="All Programs" es="Todos los Programas" />
          </Link>
          <div className="font-display text-saffron text-7xl my-6">{p.num}</div>
          <h1 className="text-[clamp(40px,7vw,72px)] text-cream text-balance leading-[1.05] mb-6">
            <T en={p.en.title} es={p.es.title} />
          </h1>
          <p className="font-accent italic text-saffron text-2xl mb-6">
            <T en={p.en.subtitle} es={p.es.subtitle} />
          </p>
          <p className="text-cream/85 text-xl max-w-3xl leading-relaxed">
            <T en={p.en.lede} es={p.es.lede} />
          </p>
        </div>
      </section>

      <section className="bg-cream py-24 md:py-32">
        <div className="container-x grid md:grid-cols-2 gap-16 max-w-5xl">
          <div>
            <p className="eyebrow text-crimson mb-4">
              <T en="What's Included" es="Qué Incluye" />
            </p>
            <h2 className="text-3xl text-navy mb-8 text-balance">
              <T en="Concrete benefits, not vague promises." es="Beneficios concretos, no promesas vagas." />
            </h2>
            <ul className="space-y-4">
              {p.en.what.map((item, i) => (
                <li key={i} className="flex gap-3 text-ink/85">
                  <span className="text-saffron font-bold mt-1">·</span>
                  <T en={item} es={p.es.what[i]} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-crimson mb-4">
              <T en="How to Get Started" es="Cómo Empezar" />
            </p>
            <h2 className="text-3xl text-navy mb-8 text-balance">
              <T en="Three steps to begin." es="Tres pasos para empezar." />
            </h2>
            <ol className="space-y-5">
              {p.en.how.map((item, i) => (
                <li key={i} className="flex gap-5">
                  <span className="font-display text-saffron text-3xl shrink-0 w-10">0{i + 1}</span>
                  <span className="text-ink/85 leading-relaxed pt-1">
                    <T en={item} es={p.es.how[i]} />
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-10 p-6 bg-parchment rounded-md border border-stone">
              <p className="eyebrow text-crimson mb-2">
                <T en="Audience" es="Audiencia" />
              </p>
              <p className="text-ink font-medium">
                <T en={p.audienceEn} es={p.audienceEs} />
              </p>
            </div>
          </div>
        </div>

        <div className="container-x mt-16 text-center">
          <Link href="/get-involved" className="btn-primary">
            <T en={p.cta.en} es={p.cta.es} />
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </PageShell>
  )
}
