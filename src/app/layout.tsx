import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#0B2A4A',
  width: 'device-width',
  initialScale: 1,
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dominican-medical-association.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Dominican Medical Association of New York · Médicos Unidos · Since 1997',
    template: '%s · Dominican Medical Association of New York',
  },
  description:
    'Dominican Medical Association of New York — A 501(c) nonprofit founded 1997. We mentor International Medical Graduates of every nationality (Dominican, Colombian, Cuban, Venezuelan, Mexican, Puerto Rican, Haitian, Spanish, Filipino, and beyond), connect patients with bilingual physicians, run community health programs across Northern Manhattan and the Bronx, and lead annual medical missions to the Dominican Republic.',
  keywords: [
    'Dominican Medical Association',
    'DMA NYC',
    'asociación médica dominicana',
    'IMG USMLE prep',
    'doctor dominicano nueva york',
    'medico hispano que habla español',
    'Washington Heights doctor',
    'Inwood medical',
    'bilingual doctor NY',
    'Hispanic physicians New York',
  ],
  authors: [{ name: 'Dominican Medical Association of New York' }],
  openGraph: {
    type: 'website',
    siteName: 'Dominican Medical Association of New York',
    locale: 'en_US',
    alternateLocale: ['es_DO'],
    images: [
      {
        url: '/assets/images/about-community.jpg',
        width: 1920,
        height: 1080,
        alt: 'Multigenerational Dominican family on a Washington Heights street',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@DmaNewyork',
    images: ['/assets/images/about-community.jpg'],
  },
  alternates: {
    canonical: SITE,
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' rx='28' fill='%230B2A4A'/%3E%3Cg fill='none' stroke='%23E8A04C' stroke-width='5' stroke-linecap='round'%3E%3Ccircle cx='100' cy='100' r='80'/%3E%3Cline x1='100' y1='44' x2='100' y2='160'/%3E%3Cpath d='M100 70 C78 78 78 92 100 100 C122 108 122 122 100 130 C78 138 78 152 100 160'/%3E%3Cpath d='M100 70 C122 78 122 92 100 100 C78 108 78 122 100 130 C122 138 122 152 100 160'/%3E%3C/g%3E%3Ccircle cx='100' cy='44' r='6' fill='%23E8A04C'/%3E%3C/svg%3E",
        type: 'image/svg+xml',
      },
    ],
  },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['MedicalOrganization', 'NGO'],
  name: 'Dominican Medical Association of New York',
  alternateName: ['DMA NY', 'Asociación Médica Dominicana de Nueva York'],
  url: SITE,
  description:
    '501(c) nonprofit medical association founded by Dominican-heritage physicians in 1997. Serves International Medical Graduates of every nationality (Dominican, Colombian, Cuban, Venezuelan, Mexican, Puerto Rican, Haitian, Spanish, Filipino, and others) plus U.S.-trained physicians serving the Hispanic and Caribbean communities of Northern Manhattan and the Bronx.',
  foundingDate: '1997-04-26',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5030 Broadway, Suite 656',
    addressLocality: 'New York',
    addressRegion: 'NY',
    postalCode: '10034',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 40.866, longitude: -73.926 },
  telephone: '+1-646-943-1502',
  email: 'info@dmanewyork.com',
  openingHours: 'Mo-Fr 09:00-17:00',
  knowsLanguage: ['en', 'es'],
  taxID: '13-3972548',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" data-lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Jost:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
          />
        </head>
        <body>
          {children}
          {/* ElevenLabs Dr. Asistente — bilingual voice agent */}
          <elevenlabs-convai agent-id="agent_3801kps8gvazew8rrcbhbk7avaye"></elevenlabs-convai>
          <script
            src="https://unpkg.com/@elevenlabs/convai-widget-embed"
            async
            type="text/javascript"
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
