'use client'
import { useState, FormEvent } from 'react'
import { T } from '@/components/i18n/T'

const TIERS = [
  { value: 'active', label: { en: 'Active Physician — $200/yr', es: 'Médico Activo — $200/año' } },
  { value: 'resident', label: { en: 'Resident — $50/yr', es: 'Residente — $50/año' } },
  { value: 'student', label: { en: 'Medical Student — Free', es: 'Estudiante — Gratis' } },
  { value: 'sponsor', label: { en: 'Sponsor — $1,000/yr', es: 'Patrocinador — $1,000/año' } },
] as const

type Status = 'idle' | 'submitting' | 'ok' | 'error'

export function ApplyForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    const payload = Object.fromEntries(formData.entries())
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `HTTP ${res.status}`)
      }
      setStatus('ok')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(message)
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div className="bg-parchment border border-palm rounded-md p-12 text-center">
        <div className="font-display text-5xl text-palm mb-6">✓</div>
        <h2 className="text-3xl text-navy mb-4">
          <T en="Application received." es="Solicitud recibida." />
        </h2>
        <p className="text-ink/80 max-w-xl mx-auto">
          <T
            en="The Application Triage Agent will draft a board memo within 24 hours. The board reviews applications weekly. You'll hear back from info@dmanewyork.com within 7 days."
            es="El Agente de Triage preparará un memo en 24 horas. La junta revisa solicitudes semanalmente. Recibirás respuesta en 7 días."
          />
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset className="bg-parchment border border-stone rounded-md p-8 space-y-5">
        <legend className="eyebrow text-crimson px-2"><T en="Personal Info" es="Información Personal" /></legend>
        <Field name="full_name" labelEn="Full Legal Name" labelEs="Nombre Legal Completo" required />
        <Field name="email" type="email" labelEn="Email" labelEs="Correo Electrónico" required />
        <Field name="phone" type="tel" labelEn="Phone" labelEs="Teléfono" required />
        <Field name="country_of_training" labelEn="Country of Medical Training" labelEs="País de Formación Médica" placeholder="Dominican Republic, Cuba, Spain, USA, etc." required />
      </fieldset>

      <fieldset className="bg-parchment border border-stone rounded-md p-8 space-y-5">
        <legend className="eyebrow text-crimson px-2"><T en="Professional" es="Profesional" /></legend>
        <Field name="npi" labelEn="NPI Number (if you have one)" labelEs="Número NPI (si tienes uno)" placeholder="10 digits — verified by Application Triage Agent" />
        <Field name="specialty" labelEn="Specialty" labelEs="Especialidad" required />
        <Field name="hospital_affiliation" labelEn="Hospital Affiliation" labelEs="Hospital Afiliado" placeholder="Mount Sinai, Columbia, NYU, etc." />
        <div>
          <label className="block eyebrow text-crimson text-[10px] mb-2">
            <T en="Languages Spoken" es="Idiomas Hablados" />
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {['Spanish', 'English', 'Haitian Creole', 'Portuguese', 'French', 'Tagalog', 'Mandarin', 'Other'].map((l) => (
              <label key={l} className="flex items-center gap-2 text-sm text-navy">
                <input type="checkbox" name="languages" value={l} className="accent-saffron" />
                {l}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="bg-parchment border border-stone rounded-md p-8 space-y-5">
        <legend className="eyebrow text-crimson px-2"><T en="Membership Tier" es="Nivel de Membresía" /></legend>
        <div className="grid sm:grid-cols-2 gap-3">
          {TIERS.map((t) => (
            <label
              key={t.value}
              className="flex items-center gap-3 p-4 bg-cream border border-stone rounded-md cursor-pointer has-[:checked]:bg-navy has-[:checked]:text-cream has-[:checked]:border-saffron transition-all"
            >
              <input type="radio" name="tier" value={t.value} required className="accent-saffron" />
              <span className="text-sm font-medium">
                <T en={t.label.en} es={t.label.es} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="bg-parchment border border-stone rounded-md p-8 space-y-5">
        <legend className="eyebrow text-crimson px-2"><T en="Why DMA?" es="¿Por qué DMA?" /></legend>
        <label className="block">
          <span className="block eyebrow text-crimson text-[10px] mb-2">
            <T en="Tell us in 2–4 sentences why you want to join DMA." es="Cuéntanos en 2–4 oraciones por qué quieres unirte." />
          </span>
          <textarea
            name="motivation"
            rows={5}
            required
            className="w-full px-4 py-3 bg-cream border border-stone rounded-md text-navy text-sm focus:outline-none focus:border-saffron"
          />
        </label>
      </fieldset>

      {status === 'error' && (
        <div className="bg-crimson/10 border border-crimson rounded-md p-4 text-sm text-crimson">
          <T en="Submission error: " es="Error al enviar: " />{errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <T en="Submitting…" es="Enviando…" />
        ) : (
          <>
            <T en="Submit Application" es="Enviar Solicitud" />
            <span aria-hidden>→</span>
          </>
        )}
      </button>

      <p className="text-xs text-ink/60 text-center">
        <T
          en="By submitting, you agree the Application Triage Agent (Claude Sonnet) may verify your NPI against CMS NPPES and draft a board memo. The board makes the final decision."
          es="Al enviar, aceptas que el Agente de Triage verifique tu NPI y prepare un memo. La junta toma la decisión final."
        />
      </p>
    </form>
  )
}

function Field({ name, type = 'text', labelEn, labelEs, placeholder, required }: { name: string; type?: string; labelEn: string; labelEs: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block eyebrow text-crimson text-[10px] mb-2">
        <T en={labelEn + (required ? ' *' : '')} es={labelEs + (required ? ' *' : '')} />
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-cream border border-stone rounded-md text-navy text-sm focus:outline-none focus:border-saffron"
      />
    </label>
  )
}
