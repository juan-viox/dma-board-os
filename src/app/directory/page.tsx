import Image from 'next/image'
import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find a Doctor · NPI-Verified Bilingual Physicians',
  description:
    'Searchable directory of NPI-verified bilingual physicians of every nationality. Filter by specialty, borough, language, insurance, and country of training.',
}

export const revalidate = 60 // ISR: refresh listings every 60s

const FALLBACK_DOCTORS = [
  { name: 'Dr. Maria Almonte', specialty: 'Pediatrics', hospital: 'Mount Sinai', borough: 'Manhattan', languages: ['Spanish', 'English'], origin: 'Dominican Republic', insurance: ['MetroPlus', 'Healthfirst', 'Aetna'], image: '/assets/images/leader-4.jpg' },
  { name: 'Dr. Rafael Peralta', specialty: 'Internal Medicine', hospital: 'NYP Allen', borough: 'Manhattan', languages: ['Spanish', 'English'], origin: 'Dominican Republic', insurance: ['MetroPlus', 'Fidelis', 'Blue Cross'], image: '/assets/images/leader-3.jpg' },
  { name: 'Dr. Casilda Balmaceda', specialty: 'Functional Neurosurgery', hospital: 'Columbia Neurology', borough: 'Manhattan', languages: ['Spanish', 'English'], origin: 'Dominican Republic', insurance: ['Blue Cross', 'Aetna'], image: '/assets/images/leader-2.jpg' },
  { name: 'Dr. Douglas Mendez', specialty: 'Research Medicine', hospital: 'Columbia / Taub Institute', borough: 'Manhattan', languages: ['Spanish', 'English'], origin: 'Dominican Republic', insurance: ['Blue Cross'], image: '/assets/images/leader-mendez.jpg' },
]

type DirectoryDoctor = (typeof FALLBACK_DOCTORS)[number] & { id?: string }

async function loadDoctors(): Promise<DirectoryDoctor[]> {
  if (!isSupabaseConfigured) return FALLBACK_DOCTORS
  try {
    const sb = await getSupabaseServer()
    const { data, error } = await sb
      .from('directory_listings')
      .select('id, name, specialty, hospital, borough, languages, origin, insurance, image_url')
      .eq('public', true)
      .order('name', { ascending: true })
    if (error || !data) return FALLBACK_DOCTORS
    return data.map((d: { id: string; name: string; specialty: string; hospital: string; borough: string; languages: string[]; origin: string; insurance: string[]; image_url: string }) => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      hospital: d.hospital,
      borough: d.borough,
      languages: d.languages || [],
      origin: d.origin,
      insurance: d.insurance || [],
      image: d.image_url || '/assets/images/leader-mendez.jpg',
    }))
  } catch {
    return FALLBACK_DOCTORS
  }
}

export default async function DirectoryPage() {
  const doctors = await loadDoctors()
  const usingLive = isSupabaseConfigured

  return (
    <PageShell>
      <section className="bg-navy text-cream py-24 md:py-32">
        <div className="container-x max-w-5xl">
          <p className="eyebrow text-saffron mb-6">
            <T en="Find a Doctor · Encuentra un Médico" es="Encuentra un Médico · Find a Doctor" />
          </p>
          <h1 className="text-[clamp(40px,7vw,84px)] text-cream text-balance leading-[1.05] mb-8">
            <T
              en={<>An <em>NPI-verified</em> directory of bilingual physicians of every nationality.</>}
              es={<>Un directorio <em>verificado-NPI</em> de médicos bilingües de toda nacionalidad.</>}
            />
          </h1>
          <p className="text-cream/85 text-lg max-w-3xl">
            <T
              en="Filter by specialty, borough, language fluency, insurance accepted, and country of training. The directory includes Dominican, Puerto Rican, Cuban, Mexican, Colombian, Venezuelan, Spanish, Haitian, Filipino, and U.S.-trained DMA members."
              es="Filtra por especialidad, condado, fluidez de idioma, seguro y país de formación."
            />
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="container-x">
          {/* Filter row (UI placeholder — wire to query params + Supabase next phase) */}
          <div className="bg-parchment border border-stone rounded-md p-6 mb-12 grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Specialty', placeholder: 'All' },
              { label: 'Borough', placeholder: 'All NYC' },
              { label: 'Language', placeholder: 'EN + ES' },
              { label: 'Insurance', placeholder: 'Any' },
              { label: 'Origin', placeholder: 'Any country' },
            ].map((f) => (
              <div key={f.label}>
                <div className="eyebrow text-crimson text-[10px] mb-1">{f.label}</div>
                <select
                  className="w-full px-3 py-2 bg-cream border border-stone rounded text-sm text-navy"
                  aria-label={f.label}
                  disabled
                >
                  <option>{f.placeholder}</option>
                </select>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((d) => (
              <article
                key={d.id ?? d.name}
                className="group bg-parchment border border-stone rounded-md overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={d.image} alt={d.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl text-navy mb-1">{d.name}</h3>
                  <p className="eyebrow text-crimson text-[10px] mb-2">{d.specialty}</p>
                  <p className="font-accent italic text-saffron text-sm mb-3">{d.hospital} · {d.borough}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {d.languages.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-cream rounded-full text-[11px] text-navy border border-stone">
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-ink/70">
                    <T en="Insurance: " es="Seguro: " />{d.insurance.join(' · ')}
                  </div>
                  <div className="text-xs text-ink/70 mt-1">
                    <T en="Trained in: " es="Formado en: " />{d.origin}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!usingLive && (
            <div className="mt-10 p-6 rounded-md bg-saffron/10 border border-saffron text-navy text-sm">
              <strong className="block eyebrow text-crimson text-[10px] mb-2">Demo Data</strong>
              <T
                en="The directory is currently showing seed data. Once Supabase is configured, the live directory pulls from the members table — board can approve/edit listings from the admin."
                es="El directorio muestra datos de demostración. Una vez configurado Supabase, mostrará datos en vivo."
              />
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
