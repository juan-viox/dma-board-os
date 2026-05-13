import Link from 'next/link'
import { DmaLogo } from '@/components/ui/DmaLogo'
import { T } from '@/components/i18n/T'

export function Footer() {
  return (
    <footer className="bg-navy-dark text-cream/80 mt-20">
      <div className="container-x py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <DmaLogo className="h-20 w-20 text-saffron" />
          <p className="font-display italic text-saffron text-lg leading-snug">
            Médicos unidos en esfuerzos y avances para la comunidad.
          </p>
          <p className="text-sm leading-relaxed">
            <T
              en="Doctors united in service to the Northern Manhattan community. Since 1997."
              es="Médicos unidos en servicio a la comunidad del Norte de Manhattan. Desde 1997."
            />
          </p>
          <address className="not-italic text-sm space-y-1 mt-4">
            <div>5030 Broadway, Suite 656</div>
            <div>New York, NY 10034</div>
            <div>
              <a href="tel:+16469431502" className="hover:text-saffron">(646) 943-1502</a>
            </div>
            <div>
              <a href="mailto:info@dmanewyork.com" className="hover:text-saffron">info@dmanewyork.com</a>
            </div>
            <div className="font-eyebrow uppercase tracking-eyebrow text-[10px] mt-2 text-saffron">
              <T en="Mon–Fri · 9 AM – 5 PM" es="Lun–Vie · 9 AM – 5 PM" />
            </div>
          </address>
        </div>

        <div>
          <h4 className="font-eyebrow uppercase tracking-eyebrow text-[11px] text-saffron mb-5">
            <T en="Explore" es="Explora" />
          </h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="hover:text-saffron"><T en="About" es="Conócenos" /></Link></li>
            <li><Link href="/programs" className="hover:text-saffron"><T en="Six Programs" es="Seis Programas" /></Link></li>
            <li><Link href="/directory" className="hover:text-saffron"><T en="Find a Doctor" es="Encuentra un Médico" /></Link></li>
            <li><Link href="/events" className="hover:text-saffron"><T en="Events &amp; News" es="Eventos y Noticias" /></Link></li>
            <li><Link href="/get-involved" className="hover:text-saffron"><T en="Get Involved" es="Participa" /></Link></li>
            <li><Link href="/apply" className="hover:text-saffron"><T en="Apply for Membership" es="Solicita Membresía" /></Link></li>
            <li><Link href="/contact" className="hover:text-saffron"><T en="Contact" es="Contacto" /></Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-eyebrow uppercase tracking-eyebrow text-[11px] text-saffron mb-5">
            <T en="Connect" es="Conecta" />
          </h4>
          <ul className="space-y-3 text-sm">
            <li><a href="https://www.facebook.com/DMANewYork" target="_blank" rel="noreferrer noopener" className="hover:text-saffron">Facebook</a></li>
            <li><a href="https://www.instagram.com/dmanewyork" target="_blank" rel="noreferrer noopener" className="hover:text-saffron">Instagram</a></li>
            <li><a href="https://x.com/DmaNewyork" target="_blank" rel="noreferrer noopener" className="hover:text-saffron">X · Twitter</a></li>
            <li><a href="https://www.guidestar.org/profile/13-3972548" target="_blank" rel="noreferrer noopener" className="hover:text-saffron">GuideStar Profile</a></li>
            <li><a href="https://www.charitynavigator.org/ein/133972548" target="_blank" rel="noreferrer noopener" className="hover:text-saffron">Charity Navigator</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x py-6 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
          <div className="font-eyebrow uppercase tracking-eyebrow opacity-70">
            501(c) Nonprofit · EIN 13-3972548 · Founded April 26, 1997
          </div>
          <div className="opacity-60">
            <T en="Built by" es="Construido por" /> <Link href="/" className="hover:text-saffron">VioX AI</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
