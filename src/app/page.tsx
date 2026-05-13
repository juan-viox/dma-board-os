import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/nav/Navbar'
import { Footer } from '@/components/nav/Footer'
import { CanvasHero } from '@/components/hero/CanvasHero'
import { T } from '@/components/i18n/T'

const PROGRAM_TEASERS = [
  {
    slug: 'usmle-prep',
    num: '01',
    en: { title: 'USMLE Board Prep Mentorship', sub: 'For IMGs of any nationality' },
    es: { title: 'Preparación para Exámenes USMLE', sub: 'Para IMGs de cualquier nacionalidad' },
    image: '/assets/images/program-usmle.jpg',
  },
  {
    slug: 'community-health',
    num: '02',
    en: { title: 'Community Health Education', sub: 'Free bilingual screenings' },
    es: { title: 'Educación Comunitaria de Salud', sub: 'Exámenes bilingües gratuitos' },
    image: '/assets/images/program-health.jpg',
  },
  {
    slug: 'residency-match',
    num: '03',
    en: { title: 'Residency Match Network', sub: 'Application support for IMGs' },
    es: { title: 'Red de Match de Residencia', sub: 'Apoyo de aplicación para IMGs' },
    image: '/assets/images/program-match.jpg',
  },
  {
    slug: 'doctor-directory',
    num: '04',
    en: { title: 'Doctor Directory · NPI-Verified', sub: 'Bilingual physicians of every nationality' },
    es: { title: 'Directorio de Médicos · Verificado-NPI', sub: 'Médicos bilingües de toda nacionalidad' },
    image: '/assets/images/program-directory.jpg',
  },
  {
    slug: 'annual-gala-cme',
    num: '05',
    en: { title: 'Annual Gala & CME Symposium', sub: 'Fundraising + Continuing Education' },
    es: { title: 'Gala Anual y Simposio CME', sub: 'Recaudación + Educación Continua' },
    image: '/assets/images/program-gala.jpg',
  },
  {
    slug: 'medical-missions-dr',
    num: '06',
    en: { title: 'Medical Missions to the DR', sub: 'Annual 7-day volunteer trip' },
    es: { title: 'Misiones Médicas a la RD', sub: 'Misión voluntaria anual de 7 días' },
    image: '/assets/images/program-missions.jpg',
  },
] as const

export default function Home() {
  return (
    <>
      <Navbar heroMode />
      <main>
        <CanvasHero />

        {/* ─── Hero transition marquee ─── */}
        <section className="bg-navy-dark text-cream py-6 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee-left">
            <div className="flex items-center gap-12 px-6 font-accent italic text-saffron text-xl">
              <span>USMLE Board Prep</span>
              <span aria-hidden>·</span>
              <span>Community Health</span>
              <span aria-hidden>·</span>
              <span>Residency Match</span>
              <span aria-hidden>·</span>
              <span>Doctor Directory</span>
              <span aria-hidden>·</span>
              <span>Annual CME Symposium</span>
              <span aria-hidden>·</span>
              <span>Medical Missions to DR</span>
              <span aria-hidden>·</span>
            </div>
            <div className="flex items-center gap-12 px-6 font-accent italic text-saffron text-xl" aria-hidden>
              <span>USMLE Board Prep</span>
              <span>·</span>
              <span>Community Health</span>
              <span>·</span>
              <span>Residency Match</span>
              <span>·</span>
              <span>Doctor Directory</span>
              <span>·</span>
              <span>Annual CME Symposium</span>
              <span>·</span>
              <span>Medical Missions to DR</span>
              <span>·</span>
            </div>
          </div>
        </section>

        {/* ─── Mission mask reveal ─── */}
        <section className="bg-cream py-24 md:py-32 text-center">
          <div className="container-x">
            <p className="eyebrow text-crimson mb-6"><T en="Our Mission" es="Nuestra Misión" /></p>
            <h2 className="text-[clamp(64px,14vw,180px)] leading-none font-display font-bold text-mask-saffron-crimson mb-8">
              SALUD
            </h2>
            <p className="font-accent italic text-2xl md:text-3xl text-navy max-w-3xl mx-auto">
              <T
                en="Médicos unidos en esfuerzos y avances para la comunidad. Desde 1997."
                es="Médicos unidos en esfuerzos y avances para la comunidad. Desde 1997."
              />
            </p>
            <p className="text-navy/70 mt-4 max-w-2xl mx-auto">
              <T
                en="Doctors united in service to the Northern Manhattan community. Since 1997."
                es="Médicos unidos en servicio a la comunidad del Norte de Manhattan. Desde 1997."
              />
            </p>
          </div>
        </section>

        {/* ─── About teaser with image ─── */}
        <section className="bg-parchment py-24 md:py-32">
          <div className="container-x grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] rounded-md overflow-hidden shadow-2xl">
              <Image
                src="/assets/images/about-community.jpg"
                alt="Multigenerational Dominican family on a Washington Heights street near 191st"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-cream">
                <p className="eyebrow text-saffron mb-3">
                  <T en="Founded April 26, 1997 · Inwood, NYC" es="Fundada 26 de Abril, 1997 · Inwood, NYC" />
                </p>
                <p className="font-accent italic text-xl leading-snug">
                  <T
                    en={'"Walk three blocks from the 191st Street A train. Coffee\'s on. Tuesday at 7pm at the office, every month."'}
                    es={'"Camina tres cuadras desde el tren A en la 191. El café está listo. Martes a las 7pm en la oficina, cada mes."'}
                  />
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow text-crimson mb-4"><T en="Since 1997" es="Desde 1997" /></p>
              <h2 className="text-4xl md:text-5xl text-navy mb-6 text-balance">
                <T
                  en={<>A 28-year institution, founded by physicians, anchored in <em>Inwood</em>.</>}
                  es={<>Una institución de 28 años, fundada por médicos, arraigada en <em>Inwood</em>.</>}
                />
              </h2>
              <div className="space-y-5 text-ink/85 leading-relaxed mb-8">
                <p>
                  <T
                    en={<><strong>Our roots are Dominican. Our doors are open.</strong> Today DMA serves and mentors International Medical Graduates of every nationality — Colombian, Cuban, Venezuelan, Mexican, Puerto Rican, Peruvian, Argentinian, Spanish, Haitian, Filipino, and beyond — alongside U.S.-trained physicians of all backgrounds who serve the Hispanic and Caribbean communities of NYC.</>}
                    es={<><strong>Nuestras raíces son dominicanas. Nuestras puertas están abiertas.</strong> Hoy DMA sirve y mentoriza a médicos formados en el extranjero de cualquier nacionalidad — colombianos, cubanos, venezolanos, mexicanos, puertorriqueños, peruanos, argentinos, españoles, haitianos, filipinos y más.</>}
                  />
                </p>
                <p>
                  <T
                    en="Twenty-eight years later, DMA is a 501(c) nonprofit serving over 1,200 physicians across NYC, with six active programs spanning USMLE board prep, the Doctor Directory, community health, residency match, the annual gala & CME symposium, and annual medical missions to the Dominican Republic."
                    es="Veintiocho años después, DMA es una organización 501(c) sin fines de lucro que sirve a más de 1,200 médicos en NYC, con seis programas activos."
                  />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { num: '28', en: 'Years Active', es: 'Años Activos' },
                  { num: '1,200+', en: 'Physicians', es: 'Médicos' },
                  { num: '6', en: 'Active Programs', es: 'Programas' },
                  { num: '501(c)', en: 'Nonprofit Status', es: 'Sin Fines de Lucro' },
                ].map((s) => (
                  <div key={s.num} className="bg-cream border border-stone rounded-md p-5">
                    <div className="font-display text-3xl text-navy">{s.num}</div>
                    <div className="eyebrow text-crimson mt-1"><T en={s.en} es={s.es} /></div>
                  </div>
                ))}
              </div>

              <Link href="/about" className="btn-outline">
                <T en="Read the Full Story" es="Conoce la Historia" />
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Programs grid ─── */}
        <section className="bg-cream py-24 md:py-32">
          <div className="container-x">
            <p className="eyebrow text-crimson mb-4"><T en="Six Programs" es="Seis Programas" /></p>
            <h2 className="text-4xl md:text-5xl text-navy mb-12 text-balance max-w-3xl">
              <T
                en={<>One mission, six concrete ways we <em>serve</em>.</>}
                es={<>Una misión, seis formas concretas en que <em>servimos</em>.</>}
              />
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROGRAM_TEASERS.map((p) => (
                <Link
                  key={p.slug}
                  href={`/programs/${p.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-md border border-stone bg-navy-dark transition-all hover:-translate-y-1 hover:shadow-2xl"
                >
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-transparent" />
                  <div className="absolute inset-0 p-7 flex flex-col justify-end text-cream">
                    <div className="font-display text-saffron text-3xl mb-3">{p.num}</div>
                    <h3 className="text-2xl text-cream mb-2">
                      <T en={p.en.title} es={p.es.title} />
                    </h3>
                    <p className="font-accent italic text-saffron mb-3">
                      <T en={p.en.sub} es={p.es.sub} />
                    </p>
                    <span className="eyebrow text-cream/80 mt-1 group-hover:text-saffron transition-colors">
                      <T en="Learn More →" es="Aprende Más →" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/programs" className="btn-outline">
                <T en="See All Programs" es="Ver Todos los Programas" />
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Get Involved CTA ─── */}
        <section className="bg-navy text-cream py-24 md:py-32 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, #E8A04C 0%, transparent 70%)', opacity: 0.18 }}
          />
          <div className="container-x relative z-10 grid lg:grid-cols-2 gap-12">
            <div>
              <p className="eyebrow text-saffron mb-4">
                <T en="Join the Mission" es="Únete a la Misión" />
              </p>
              <h2 className="text-4xl md:text-5xl text-cream mb-6 text-balance">
                <T
                  en={<>Membership for physicians, donations for the <em>community</em>.</>}
                  es={<>Membresía para médicos, donaciones para la <em>comunidad</em>.</>}
                />
              </h2>
              <p className="text-cream/80 mb-8 leading-relaxed max-w-xl">
                <T
                  en="Active Physician $200/yr · Resident $50/yr · Medical Student free · Sponsor $1,000/yr. Donations support IMG mentorship, free community screenings, and medical missions to the Dominican Republic."
                  es="Médico Activo $200/año · Residente $50/año · Estudiante gratis · Patrocinador $1,000/año."
                />
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/apply" className="btn-primary">
                  <T en="Apply for Membership" es="Solicita Membresía" />
                </Link>
                <Link href="/get-involved" className="btn-glass">
                  <T en="Donate · Dona" es="Donate · Dona" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { en: '$50', sub: { en: '1 hour of mock-interview prep', es: '1 hora de entrevista de práctica' } },
                { en: '$250', sub: { en: '1 community health screening', es: '1 examen comunitario' } },
                { en: '$1,000', sub: { en: '1 med-student summer fellowship', es: '1 beca de verano' } },
                { en: '$5,000', sub: { en: '1 mission day in the DR', es: '1 día de misión en la RD' } },
              ].map((t) => (
                <div key={t.en} className="border border-cream/20 rounded-md p-6 bg-cream/[0.04] backdrop-blur">
                  <div className="font-display text-saffron text-3xl mb-2">{t.en}</div>
                  <p className="text-sm text-cream/75">
                    <T en={t.sub.en} es={t.sub.es} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
