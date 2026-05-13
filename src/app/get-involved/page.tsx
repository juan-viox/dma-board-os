import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Involved · Become a Member or Donate',
  description:
    'Become a DMA member ($50–$1,000/yr), donate to community programs, sponsor a med-student fellowship, or volunteer for a Dominican Republic mission.',
}

type Tier = {
  key: string
  primary?: boolean
  en: { name: string; price: string; cadence: string; includes: string[] }
  es: { name: string; price: string; cadence: string; includes: string[] }
}

const TIERS: Tier[] = [
  {
    key: 'active',
    primary: true,
    en: { name: 'Active Physician', price: '$200', cadence: '/year', includes: ['Voting member', 'Free CME at the annual symposium', 'Doctor Directory profile', 'Mission trip eligibility', 'Member-only resources', 'Monthly conference invitations'] },
    es: { name: 'Médico Activo', price: '$200', cadence: '/año', includes: ['Miembro votante', 'CME gratis en el simposio', 'Perfil en el Directorio', 'Elegibilidad para misiones', 'Recursos exclusivos', 'Invitaciones mensuales'] },
  },
  {
    key: 'resident',
    en: { name: 'Resident', price: '$50', cadence: '/year', includes: ['All Active benefits at reduced rate', 'USMLE/Match peer network', 'Mentorship pairing'] },
    es: { name: 'Residente', price: '$50', cadence: '/año', includes: ['Todos los beneficios Activos a precio reducido', 'Red de pares USMLE/Match', 'Emparejamiento de mentoría'] },
  },
  {
    key: 'student',
    en: { name: 'Medical Student', price: 'Free', cadence: '', includes: ['Mentorship matching', 'Free attendance at all DMA events', 'Eligible for DMA Summer Fellowship'] },
    es: { name: 'Estudiante de Medicina', price: 'Gratis', cadence: '', includes: ['Emparejamiento con mentor', 'Asistencia gratis a eventos DMA', 'Elegible para la Beca de Verano'] },
  },
  {
    key: 'sponsor',
    en: { name: 'Sponsor', price: '$1,000', cadence: '/year', includes: ['Logo placement on the website + gala', 'Recognition at every public event', 'Tax-deductible 501(c) contribution'] },
    es: { name: 'Patrocinador', price: '$1,000', cadence: '/año', includes: ['Logo en el sitio + gala', 'Reconocimiento en cada evento público', 'Contribución deducible 501(c)'] },
  },
]

const DONATIONS = [
  { en: '$50', sub: { en: 'funds 1 hour of IMG mock-interview prep (any nationality)', es: 'financia 1 hora de entrevista de práctica IMG' } },
  { en: '$100', sub: { en: 'sends 1 IMG to a USMLE Qbank subscription month', es: 'envía 1 IMG a un mes de suscripción Qbank' } },
  { en: '$250', sub: { en: 'funds a community health screening event', es: 'financia un examen comunitario' } },
  { en: '$500', sub: { en: 'sends supplies for 1 day of the DR medical mission', es: 'envía suministros para 1 día de misión' } },
  { en: '$1,000', sub: { en: 'funds a bilingual med-student summer fellowship', es: 'financia una beca de verano' } },
  { en: '$5,000', sub: { en: 'underwrites 1 day of the DR mission for a full team', es: 'patrocina 1 día completo de misión' } },
]

export default function GetInvolvedPage() {
  return (
    <PageShell>
      <section className="bg-navy text-cream py-24 md:py-32 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, #E8A04C 0%, transparent 70%)', opacity: 0.18 }}
        />
        <div className="container-x relative z-10 max-w-4xl">
          <p className="eyebrow text-saffron mb-6">
            <T en="Get Involved · Participa" es="Participa · Get Involved" />
          </p>
          <h1 className="text-[clamp(40px,7vw,84px)] text-cream text-balance leading-[1.05] mb-8">
            <T
              en={<>Membership for <em>physicians</em>, donations for the <em>community</em>.</>}
              es={<>Membresía para <em>médicos</em>, donaciones para la <em>comunidad</em>.</>}
            />
          </h1>
          <p className="text-cream/85 text-xl leading-relaxed">
            <T
              en="Open to physicians of every nationality. Open to donors of every background. Each tier funds a specific outcome — no vague impact statements."
              es="Abierto a médicos de cualquier nacionalidad. Abierto a donantes de cualquier origen. Cada nivel financia un resultado específico — sin promesas vagas."
            />
          </p>
        </div>
      </section>

      <section className="bg-cream py-24 md:py-32">
        <div className="container-x">
          <p className="eyebrow text-crimson mb-4"><T en="Membership · Membresía" es="Membresía" /></p>
          <h2 className="text-4xl md:text-5xl text-navy mb-12 text-balance">
            <T
              en={<>Four tiers. <em>One commitment</em> to the community.</>}
              es={<>Cuatro niveles. <em>Un compromiso</em> con la comunidad.</>}
            />
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((t) => (
              <div
                key={t.key}
                className={`rounded-md p-8 flex flex-col ${
                  t.primary ? 'bg-navy text-cream border-2 border-saffron' : 'bg-parchment border border-stone text-navy'
                }`}
              >
                {t.primary && (
                  <div className="eyebrow text-saffron text-[10px] mb-3"><T en="Most Popular" es="Más Popular" /></div>
                )}
                <h3 className="text-2xl mb-2">
                  <T en={t.en.name} es={t.es.name} />
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl text-saffron">
                    <T en={t.en.price} es={t.es.price} />
                  </span>
                  <span className="text-sm opacity-70">
                    <T en={t.en.cadence} es={t.es.cadence} />
                  </span>
                </div>
                <ul className="space-y-2 text-sm mb-6 flex-1">
                  {t.en.includes.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-saffron">✓</span>
                      <T en={line} es={t.es.includes[i]} />
                    </li>
                  ))}
                </ul>
                <Link
                  href="/apply"
                  className={
                    t.primary ? 'btn-primary justify-center w-full' : 'btn-outline justify-center w-full'
                  }
                >
                  <T en="Apply" es="Aplica" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy text-cream py-24 md:py-32">
        <div className="container-x">
          <p className="eyebrow text-saffron mb-4"><T en="Donate · Dona" es="Dona · Donate" /></p>
          <h2 className="text-4xl md:text-5xl text-cream mb-12 text-balance">
            <T
              en={<>Every dollar funds a <em>named outcome</em>.</>}
              es={<>Cada dólar financia un <em>resultado específico</em>.</>}
            />
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DONATIONS.map((d) => (
              <button
                key={d.en}
                type="button"
                className="text-left p-6 rounded-md bg-cream/[0.04] border border-cream/20 backdrop-blur-md transition-all hover:bg-cream/10 hover:-translate-y-1 hover:border-saffron"
              >
                <div className="font-display text-saffron text-3xl mb-2">{d.en}</div>
                <p className="text-sm text-cream/80">
                  <T en={d.sub.en} es={d.sub.es} />
                </p>
              </button>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-md bg-cream/[0.05] border border-cream/15 max-w-3xl mx-auto text-center text-sm text-cream/80">
            <T
              en="DMA is a 501(c) nonprofit. EIN 13-3972548. Every donation is tax-deductible to the extent permitted by law. Receipts are auto-generated by the Donation Acknowledgment Agent — board members review thank-you notes before send."
              es="DMA es una organización 501(c). EIN 13-3972548. Cada donación es deducible de impuestos. Los recibos son generados automáticamente."
            />
          </div>
        </div>
      </section>
    </PageShell>
  )
}
