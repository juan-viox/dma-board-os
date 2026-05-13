import Image from 'next/image'
import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About · Our Roots Are Dominican. Our Doors Are Open.',
  description:
    'Founded April 26, 1997 in Inwood. A 28-year 501(c) nonprofit serving International Medical Graduates of every nationality and the Hispanic + Caribbean communities of NYC.',
}

const LEADERS = [
  {
    name: 'Dr. Douglas Mendez',
    role: 'Co-Chair · Board of Directors',
    affiliation: 'Sergievsky Center & Taub Institute, Columbia University',
    image: '/assets/images/leader-mendez.jpg',
    initials: 'DM',
    bioEn: 'Senior Staff Associate for Research at Columbia. Coordinates DMA\'s monthly conference programming. Led the March 2025 Columbia Neurosurgery + DMA Movement Disorders symposium.',
    bioEs: 'Asociado Senior de Investigación en Columbia. Coordina la programación mensual de conferencias de DMA.',
  },
  {
    name: 'Dr. Casilda Balmaceda',
    role: 'Member · Clinical Advisor',
    affiliation: 'Co-Chief of Functional Neurosurgery, Columbia Neurology',
    image: '/assets/images/leader-2.jpg',
    initials: 'CB',
    bioEn: '"A kindred spirit in Dr. Baltuch regarding patient care for the Hispanic community."',
    bioEs: 'Co-Jefa de Neurocirugía Funcional en Columbia Neurology.',
  },
  {
    name: 'Dr. Rafael Peralta',
    role: 'Member · Board of Directors',
    affiliation: 'Internal Medicine, NewYork-Presbyterian Allen',
    image: '/assets/images/leader-3.jpg',
    initials: 'RP',
    bioEn: 'Internal Medicine and Diabetes specialist. Leads DMA\'s bilingual diabetes screening clinics across Inwood and the Bronx.',
    bioEs: 'Especialista en Medicina Interna y Diabetes.',
  },
  {
    name: 'Dr. Maria Almonte',
    role: 'Member · Board of Directors',
    affiliation: 'Pediatrics, Mount Sinai',
    image: '/assets/images/leader-4.jpg',
    initials: 'MA',
    bioEn: 'Pediatrician and adolescent medicine specialist. Long-time advocate for bilingual youth health resources.',
    bioEs: 'Pediatra y especialista en medicina de adolescentes.',
  },
]

export default function AboutPage() {
  return (
    <PageShell>
      <section className="bg-navy text-cream py-24 md:py-32 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, #E8A04C 0%, transparent 70%)', opacity: 0.18 }}
        />
        <div className="container-x relative z-10 max-w-4xl">
          <p className="eyebrow text-saffron mb-6"><T en="About · Conócenos" es="Acerca de · About" /></p>
          <h1 className="text-[clamp(40px,7vw,84px)] text-cream text-balance leading-[1.05] mb-8">
            <T
              en={<>Our roots are <em>Dominican</em>. Our doors are open.</>}
              es={<>Nuestras raíces son <em>dominicanas</em>. Nuestras puertas están abiertas.</>}
            />
          </h1>
          <p className="text-cream/85 text-xl leading-relaxed">
            <T
              en="Founded April 26, 1997 in Inwood. A 28-year 501(c) nonprofit serving International Medical Graduates of every nationality and the Hispanic + Caribbean communities of NYC."
              es="Fundada el 26 de abril de 1997 en Inwood. Una organización 501(c) de 28 años que sirve a médicos internacionales de cualquier nacionalidad y a las comunidades hispana y caribeña de NYC."
            />
          </p>
        </div>
      </section>

      <section className="bg-cream py-24 md:py-32">
        <div className="container-x grid lg:grid-cols-2 gap-16 items-start">
          <div className="relative aspect-[4/5] rounded-md overflow-hidden shadow-2xl sticky top-32">
            <Image
              src="/assets/images/about-community.jpg"
              alt="Multigenerational Dominican family on a Washington Heights street"
              fill
              className="object-cover"
            />
          </div>
          <article className="prose prose-lg max-w-none">
            <p className="eyebrow text-crimson mb-4"><T en="The Founding" es="La Fundación" /></p>
            <h2 className="text-4xl text-navy mb-6 text-balance">
              <T
                en={<>The gap no national association could <em>fill</em>.</>}
                es={<>La brecha que ninguna asociación nacional podía <em>llenar</em>.</>}
              />
            </h2>
            <div className="space-y-5 text-ink/85 leading-relaxed">
              <p>
                <T
                  en="The Dominican Medical Association of New York was founded on April 26, 1997 by a group of Dominican-heritage physicians who saw a gap that no national association could fill — culturally specific, neighborhood-rooted, bilingual medical leadership in Northern Manhattan and the Bronx."
                  es="La Asociación Médica Dominicana de Nueva York fue fundada el 26 de abril de 1997 por un grupo de médicos de herencia dominicana que vieron una brecha que ninguna asociación nacional podía llenar — liderazgo médico culturalmente específico, arraigado en el barrio, y bilingüe."
                />
              </p>
              <p>
                <T
                  en="Twenty-eight years later, DMA serves over 1,200 physicians across NYC. While the organization was founded by Dominican-heritage doctors and continues to honor that origin, today its membership and services are open to International Medical Graduates of every nationality."
                  es="Veintiocho años después, DMA sirve a más de 1,200 médicos en NYC. Aunque la organización fue fundada por médicos de herencia dominicana y continúa honrando ese origen, hoy su membresía y servicios están abiertos a IMGs de cualquier nacionalidad."
                />
              </p>
              <p>
                <strong><T en="Who DMA serves today:" es="A quién sirve DMA hoy:" /></strong>
              </p>
              <ul className="list-disc list-inside space-y-2 text-ink/80">
                <li><T en="Dominican-heritage physicians (founding constituency)" es="Médicos de herencia dominicana (constituyente fundador)" /></li>
                <li><T en="Latin American IMGs: Colombia, Venezuela, Peru, Mexico, Cuba, Puerto Rico, Argentina, Spain, Honduras, Ecuador, Chile, El Salvador, and beyond" es="IMGs latinoamericanos" /></li>
                <li><T en="Caribbean IMGs: Haiti, Jamaica, Trinidad and Tobago" es="IMGs del Caribe" /></li>
                <li><T en="Filipino IMGs (large NYC community)" es="IMGs filipinos" /></li>
                <li><T en="U.S.-trained physicians of any background who serve the Hispanic and Caribbean communities" es="Médicos formados en EE.UU. de cualquier origen" /></li>
                <li><T en="Allied health professionals — dentists, NPs, PAs, midwives" es="Profesionales aliados de la salud" /></li>
              </ul>

              <h3 className="text-3xl text-navy mt-12 mb-4">
                <T en="Recent Highlight · March 2025" es="Destacado Reciente · Marzo 2025" />
              </h3>
              <p>
                <T
                  en="DMA partnered with Columbia Neurosurgery and Columbia Neurology to host a community physician education program: 'Surgical Management of Movement Disorders — A Multidisciplinary Approach.' Speakers included Dr. Casilda Balmaceda (Co-Chief of Functional Neurosurgery) and Dr. Gordon Baltuch (Neurosurgery), with topics covering Parkinson's Disease, Essential Tremor, and Alzheimer's."
                  es="DMA se asoció con Columbia Neurocirugía y Neurología para presentar un programa educativo médico comunitario: 'Manejo Quirúrgico de Trastornos del Movimiento — Un Enfoque Multidisciplinario.'"
                />
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-parchment py-24 md:py-32">
        <div className="container-x">
          <p className="eyebrow text-crimson mb-4"><T en="Leadership · Liderazgo" es="Liderazgo · Leadership" /></p>
          <h2 className="text-4xl md:text-5xl text-navy mb-12 text-balance max-w-3xl">
            <T
              en={<>Anchored in real <em>institutional</em> credibility.</>}
              es={<>Anclado en credibilidad <em>institucional</em> real.</>}
            />
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {LEADERS.map((leader) => (
              <div key={leader.name} className="bg-cream border border-stone rounded-md p-8 flex gap-6 items-start">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-saffron shrink-0">
                  <Image src={leader.image} alt={leader.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl text-navy mb-1">{leader.name}</h3>
                  <p className="eyebrow text-crimson mb-2">{leader.role}</p>
                  <p className="font-accent italic text-saffron text-sm mb-2">{leader.affiliation}</p>
                  <p className="text-ink/80 text-sm">
                    <T en={leader.bioEn} es={leader.bioEs} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
