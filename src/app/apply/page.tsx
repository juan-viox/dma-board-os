import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import { ApplyForm } from './ApplyForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apply for Membership',
  description:
    'Apply for DMA membership. Open to physicians of every nationality serving the Hispanic + Caribbean community of NYC.',
}

export default function ApplyPage() {
  return (
    <PageShell>
      <section className="bg-navy text-cream py-20 md:py-24">
        <div className="container-x max-w-3xl">
          <p className="eyebrow text-saffron mb-4"><T en="Membership Application" es="Solicitud de Membresía" /></p>
          <h1 className="text-[clamp(36px,6vw,68px)] text-cream text-balance leading-[1.05] mb-4">
            <T
              en={<>Open to physicians of <em>every</em> nationality.</>}
              es={<>Abierto a médicos de <em>cualquier</em> nacionalidad.</>}
            />
          </h1>
          <p className="text-cream/85 text-lg">
            <T
              en="The board reviews applications weekly. The Application Triage Agent (Claude Sonnet) drafts a board memo for each new application — verifies NPI against CMS NPPES, scores fit against DMA's mission, and surfaces any red flags. Final decision is always made by humans."
              es="La junta revisa las solicitudes semanalmente. El Agente de Triage de Solicitudes (Claude) prepara un memo para cada nueva aplicación. La decisión final siempre la toma un humano."
            />
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="container-x max-w-3xl">
          <ApplyForm />
        </div>
      </section>
    </PageShell>
  )
}
