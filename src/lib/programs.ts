/** Program catalog — single source of truth for /programs index + dynamic detail pages. */

export type Program = {
  slug: string
  num: string
  image: string
  audienceEn: string
  audienceEs: string
  cta: { en: string; es: string }
  en: { title: string; subtitle: string; lede: string; what: string[]; how: string[] }
  es: { title: string; subtitle: string; lede: string; what: string[]; how: string[] }
}

export const PROGRAMS: Program[] = [
  {
    slug: 'usmle-prep',
    num: '01',
    image: '/assets/images/program-usmle.jpg',
    audienceEn: 'Foreign-trained doctors of any nationality seeking U.S. licensure',
    audienceEs: 'Médicos formados en el extranjero de cualquier nacionalidad',
    cta: { en: 'Apply to the next cohort', es: 'Aplica a la próxima cohorte' },
    en: {
      title: 'USMLE Board Prep Mentorship',
      subtitle: 'Preparación para Exámenes USMLE',
      lede: 'Pairs International Medical Graduates (IMGs) of any country with established physicians for one-on-one mentorship through Steps 1, 2, and 3.',
      what: [
        'Dedicated DMA mentor matched to your specialty + study schedule',
        'Bilingual study group running weekly via Zoom + WhatsApp',
        'Open to IMGs from Dominican Republic, Colombia, Cuba, Venezuela, Mexico, Peru, Spain, Haiti, the Philippines, and beyond',
        '12-week DMA Step 1 Cohort with public progress dashboard',
        'Free for DMA members; tier-based for non-members',
      ],
      how: [
        'Email info@dmanewyork.com or call (646) 943-1502',
        'Get matched with a mentor within 1 week',
        'Join the next cohort start (quarterly)',
      ],
    },
    es: {
      title: 'Preparación para Exámenes USMLE',
      subtitle: 'USMLE Board Prep Mentorship',
      lede: 'Empareja a IMGs de cualquier país con médicos establecidos para mentoría uno-a-uno en los Pasos 1, 2 y 3.',
      what: [
        'Mentor DMA dedicado emparejado a tu especialidad y horario de estudio',
        'Grupo de estudio bilingüe semanal vía Zoom + WhatsApp',
        'Abierto a IMGs de RD, Colombia, Cuba, Venezuela, México, Perú, España, Haití, Filipinas y más',
        'Cohorte DMA Step 1 de 12 semanas con tablero público de progreso',
        'Gratis para miembros DMA; basado en niveles para no-miembros',
      ],
      how: [
        'Escribe a info@dmanewyork.com o llama al (646) 943-1502',
        'Te emparejaremos con un mentor en 1 semana',
        'Únete al próximo inicio de cohorte (trimestral)',
      ],
    },
  },
  {
    slug: 'community-health',
    num: '02',
    image: '/assets/images/program-health.jpg',
    audienceEn: 'Latino, Caribbean, and immigrant communities of NYC',
    audienceEs: 'Comunidades latinas, caribeñas e inmigrantes de NYC',
    cta: { en: 'Find a free screening near you', es: 'Encuentra un examen gratis' },
    en: {
      title: 'Community Health Education',
      subtitle: 'Educación Comunitaria de Salud',
      lede: 'Bilingual seminars and screenings on diabetes, hypertension, mental health, and preventive care across Northern Manhattan and the Bronx.',
      what: [
        'Free monthly bilingual screenings — diabetes, blood pressure, mental health',
        'Co-hosted with Alianza Dominicana, ACDP, NMIC, Hispanic Federation',
        'Special programming for Hispanic Heritage Month, World Diabetes Day, etc.',
        'Always 100% free for community members',
      ],
      how: [
        'Check the Events page for the next screening near you',
        'Walk in — no appointment needed',
        'Bring family — children, abuelos, todos',
      ],
    },
    es: {
      title: 'Educación Comunitaria de Salud',
      subtitle: 'Community Health Education',
      lede: 'Seminarios y exámenes bilingües sobre diabetes, hipertensión, salud mental y cuidado preventivo en el Norte de Manhattan y el Bronx.',
      what: [
        'Exámenes bilingües gratuitos cada mes — diabetes, presión, salud mental',
        'Co-organizado con Alianza Dominicana, ACDP, NMIC, Hispanic Federation',
        'Programación especial para el Mes de la Herencia Hispana, Día Mundial de la Diabetes',
        'Siempre 100% gratis para la comunidad',
      ],
      how: [
        'Revisa la página de Eventos para el próximo examen cerca de ti',
        'Llega sin cita — no es necesario reservar',
        'Trae a la familia — niños, abuelos, todos',
      ],
    },
  },
  {
    slug: 'residency-match',
    num: '03',
    image: '/assets/images/program-match.jpg',
    audienceEn: 'IMGs of any nationality entering the residency Match',
    audienceEs: 'IMGs de cualquier nacionalidad entrando al Match',
    cta: { en: 'Book a mock interview', es: 'Reserva entrevista de práctica' },
    en: {
      title: 'Residency Match Network',
      subtitle: 'Red de Match de Residencia',
      lede: 'Application support, mock interviews, and connections to local hospital residency programs for IMGs from every country.',
      what: [
        'ERAS application review by experienced Match-side physicians',
        'Mock interviews — bilingual EN/ES, recorded for self-review',
        'Free filterable list of IMG-friendly NY residency programs',
        'Personal statement workshop',
        'Open to all nationalities',
      ],
      how: [
        'Email info@dmanewyork.com to start',
        'Submit ERAS draft + Step scores for free review',
        'Schedule mock interviews October–January',
      ],
    },
    es: {
      title: 'Red de Match de Residencia',
      subtitle: 'Residency Match Network',
      lede: 'Apoyo con aplicaciones, entrevistas de práctica, y conexiones con programas de residencia para IMGs de todos los países.',
      what: [
        'Revisión de aplicación ERAS por médicos con experiencia en Match',
        'Entrevistas de práctica bilingües, grabadas para auto-revisión',
        'Lista filtrable de programas amigables para IMGs',
        'Taller de declaración personal',
        'Abierto a todas las nacionalidades',
      ],
      how: [
        'Escribe a info@dmanewyork.com',
        'Envía borrador ERAS + puntajes Step',
        'Agenda entrevistas Oct–Ene',
      ],
    },
  },
  {
    slug: 'doctor-directory',
    num: '04',
    image: '/assets/images/program-directory.jpg',
    audienceEn: 'Patients seeking culturally-aligned bilingual care',
    audienceEs: 'Pacientes buscando atención bilingüe culturalmente alineada',
    cta: { en: 'Search the directory', es: 'Busca el directorio' },
    en: {
      title: 'Doctor Directory · NPI-Verified',
      subtitle: 'Directorio de Médicos · Verificado-NPI',
      lede: 'Searchable directory of bilingual physicians of every nationality, NPI-verified DMA members.',
      what: [
        'Filter by specialty, borough, language fluency, insurance accepted, country of training',
        'Includes Dominican, Puerto Rican, Cuban, Mexican, Colombian, Venezuelan, Spanish, Haitian, Filipino, U.S.-trained members',
        'Insurance filters for MetroPlus, Fidelis, Healthfirst, Aetna, Blue Cross',
        'Walking-distance-from-subway filter',
        'Free for patients · opt-in profile for DMA members',
      ],
      how: [
        'Open /directory and filter for what matters',
        'Click a profile to see hospital affiliation, NPI, languages',
        'Members log in to update their own listing',
      ],
    },
    es: {
      title: 'Directorio de Médicos · Verificado-NPI',
      subtitle: 'Doctor Directory',
      lede: 'Directorio buscable de médicos bilingües de toda nacionalidad, miembros DMA verificados con NPI.',
      what: [
        'Filtra por especialidad, condado, fluidez de idioma, seguro, país de formación',
        'Incluye médicos dominicanos, puertorriqueños, cubanos, mexicanos, colombianos, venezolanos, españoles, haitianos, filipinos, formados en EE.UU.',
        'Filtros de seguro: MetroPlus, Fidelis, Healthfirst, Aetna, Blue Cross',
        'Filtro de distancia caminable desde el metro',
        'Gratis para pacientes · perfil opcional para miembros DMA',
      ],
      how: [
        'Abre /directory y filtra por lo que importa',
        'Haz clic en un perfil para ver hospital, NPI, idiomas',
        'Los miembros inician sesión para actualizar su perfil',
      ],
    },
  },
  {
    slug: 'annual-gala-cme',
    num: '05',
    image: '/assets/images/program-gala.jpg',
    audienceEn: 'Members, sponsors, and the broader medical community',
    audienceEs: 'Miembros, patrocinadores, y la comunidad médica',
    cta: { en: 'Reserve a table', es: 'Reserva una mesa' },
    en: {
      title: 'Annual Gala & CME Symposium',
      subtitle: 'Gala Anual y Simposio CME',
      lede: 'Yearly fundraising gala paired with continuing medical education for members. Coordinated by Dr. Douglas Mendez.',
      what: [
        'Black-tie evening at a Manhattan ballroom',
        'CME accreditation for member physicians',
        'Honoree categories: Lifetime Service, Rising IMG, Community Partner',
        'Sponsor tiers from $1K to $50K',
        'Date TBD 2026 — subscribe to the newsletter for the announcement',
      ],
      how: [
        'Reserve a seat or table on the Events page',
        'Sponsor inquiries: info@dmanewyork.com',
        'Nominate an honoree by Sept 1',
      ],
    },
    es: {
      title: 'Gala Anual y Simposio CME',
      subtitle: 'Annual Gala & CME Symposium',
      lede: 'Gala anual de recaudación de fondos con educación médica continua. Coordinada por el Dr. Douglas Mendez.',
      what: [
        'Velada de etiqueta en un salón de Manhattan',
        'Acreditación CME para médicos miembros',
        'Categorías de homenaje: Servicio de Vida, IMG Emergente, Socio Comunitario',
        'Niveles de patrocinio de $1K a $50K',
        'Fecha TBD 2026',
      ],
      how: [
        'Reserva asiento o mesa en la página de Eventos',
        'Consultas de patrocinio: info@dmanewyork.com',
        'Nomina un homenajeado antes del 1 de septiembre',
      ],
    },
  },
  {
    slug: 'medical-missions-dr',
    num: '06',
    image: '/assets/images/program-missions.jpg',
    audienceEn: 'Volunteer physicians + DR communities',
    audienceEs: 'Médicos voluntarios + comunidades de la RD',
    cta: { en: 'Volunteer or sponsor a day', es: 'Sé voluntario o patrocina un día' },
    en: {
      title: 'Medical Missions to the Dominican Republic',
      subtitle: 'Misiones Médicas',
      lede: 'Annual 7-day mission to a partner clinic in the DR — surgical, dental, primary care. Open to member-physicians of any nationality.',
      what: [
        '7 days serving an under-resourced clinic in the DR',
        'Surgical, dental, primary care, pediatrics, OB/GYN',
        'DMA covers logistics; volunteers cover travel',
        'Daily photo/video updates from the field',
        '"Donate-a-day" giving form for non-traveling supporters',
      ],
      how: [
        'Apply via the Get Involved page',
        'Mission interest deadline: Mar 1 each year',
        'Travel typically May or November',
      ],
    },
    es: {
      title: 'Misiones Médicas a la República Dominicana',
      subtitle: 'Medical Missions',
      lede: 'Misión anual de 7 días a una clínica aliada en RD — cirugía, dental, atención primaria. Abierta a médicos miembros de cualquier nacionalidad.',
      what: [
        '7 días sirviendo en una clínica con recursos limitados en RD',
        'Cirugía, dental, atención primaria, pediatría, OB/GYN',
        'DMA cubre logística; voluntarios cubren viaje',
        'Actualizaciones diarias con fotos/video desde el campo',
        'Formulario "donate-a-day" para quienes no viajan',
      ],
      how: [
        'Aplica en la página Participa',
        'Fecha límite de interés: 1 de marzo cada año',
        'Viaje típicamente en mayo o noviembre',
      ],
    },
  },
]
