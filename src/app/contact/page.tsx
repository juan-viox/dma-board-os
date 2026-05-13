import { PageShell } from '@/components/PageShell'
import { T } from '@/components/i18n/T'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    '5030 Broadway, Suite 656, New York NY 10034 · (646) 943-1502 · info@dmanewyork.com · Mon–Fri 9 AM–5 PM. Or talk to Dr. Asistente, the bilingual AI concierge available 24/7.',
}

export default function ContactPage() {
  return (
    <PageShell>
      <section className="bg-navy text-cream py-24 md:py-32">
        <div className="container-x max-w-4xl">
          <p className="eyebrow text-saffron mb-6"><T en="Contact · Contacto" es="Contacto · Contact" /></p>
          <h1 className="text-[clamp(40px,7vw,84px)] text-cream text-balance leading-[1.05] mb-8">
            <T
              en={<>Walk three blocks from the <em>191st</em> Street A train.</>}
              es={<>Camina tres cuadras desde el tren A de la <em>191</em>.</>}
            />
          </h1>
          <p className="text-cream/85 text-xl">
            <T
              en="Coffee's on. Tuesday at 7 PM at the office, every month. Or talk to Dr. Asistente — the bilingual AI concierge available 24/7 in the bottom-right corner of every page."
              es="El café está listo. Martes a las 7 PM en la oficina, cada mes. O habla con Dr. Asistente — el concierge AI bilingüe disponible 24/7."
            />
          </p>
        </div>
      </section>

      <section className="bg-cream py-24 md:py-32">
        <div className="container-x grid md:grid-cols-2 gap-12 max-w-5xl">
          <div className="space-y-6">
            <div>
              <p className="eyebrow text-crimson mb-2"><T en="Address" es="Dirección" /></p>
              <p className="text-navy text-lg">5030 Broadway, Suite 656</p>
              <p className="text-navy text-lg">New York, NY 10034</p>
              <p className="text-ink/70 text-sm mt-2"><T en="Inwood · Northern Manhattan" es="Inwood · Norte de Manhattan" /></p>
            </div>
            <div>
              <p className="eyebrow text-crimson mb-2"><T en="Phone" es="Teléfono" /></p>
              <a href="tel:+16469431502" className="text-navy text-lg hover:text-saffron">(646) 943-1502</a>
            </div>
            <div>
              <p className="eyebrow text-crimson mb-2"><T en="Email" es="Correo" /></p>
              <a href="mailto:info@dmanewyork.com" className="text-navy text-lg hover:text-saffron">info@dmanewyork.com</a>
            </div>
            <div>
              <p className="eyebrow text-crimson mb-2"><T en="Office Hours" es="Horario" /></p>
              <p className="text-navy text-lg"><T en="Monday–Friday · 9 AM – 5 PM" es="Lunes–Viernes · 9 AM – 5 PM" /></p>
              <p className="text-ink/70 text-sm mt-1"><T en="Community events many evenings + weekends — check Events page." es="Eventos comunitarios muchas tardes y fines de semana — revisa la página de Eventos." /></p>
            </div>
            <div>
              <p className="eyebrow text-crimson mb-2"><T en="Closest Trains" es="Trenes Cercanos" /></p>
              <p className="text-navy"><T en="A train · 191st Street (3 blocks)" es="Tren A · Calle 191 (3 cuadras)" /></p>
              <p className="text-navy"><T en="A train · 207th Street" es="Tren A · Calle 207" /></p>
              <p className="text-navy"><T en="1 train · Dyckman Street" es="Tren 1 · Calle Dyckman" /></p>
            </div>
          </div>

          <div>
            <div className="aspect-square rounded-md overflow-hidden border border-stone bg-parchment relative">
              <iframe
                title="DMA office on a map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-73.93%2C40.86%2C-73.92%2C40.872&layer=mapnik&marker=40.866%2C-73.926"
                className="w-full h-full"
                loading="lazy"
              />
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=5030+Broadway+New+York+NY+10034"
              target="_blank"
              rel="noreferrer noopener"
              className="block text-center mt-4 text-sm text-saffron hover:text-crimson"
            >
              <T en="Open in Google Maps →" es="Abrir en Google Maps →" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-saffron text-navy py-16 text-center">
        <div className="container-x max-w-2xl">
          <h2 className="text-3xl font-display font-medium mb-4">
            <T
              en={<>Need help right now? <em>Habla con Dr. Asistente.</em></>}
              es={<>¿Necesitas ayuda ahora? <em>Habla con Dr. Asistente.</em></>}
            />
          </h2>
          <p className="text-navy/85 mb-2">
            <T
              en="Bilingual AI voice concierge powered by ElevenLabs. Click the floating widget in the bottom-right corner of any page."
              es="Concierge AI bilingüe por ElevenLabs. Haz clic en el widget flotante abajo a la derecha."
            />
          </p>
        </div>
      </section>
    </PageShell>
  )
}
