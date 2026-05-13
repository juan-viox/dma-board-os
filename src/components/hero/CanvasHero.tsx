'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { T } from '@/components/i18n/T'

const FRAME_COUNT = 121
const FRAME_PATH = (i: number) => `/assets/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`

export function CanvasHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const hero = heroRef.current
    if (!canvas || !hero) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawFrame = (idx: number) => {
      const img = imagesRef.current[idx]
      if (!img || !img.complete || !img.naturalWidth) return
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    setCanvasSize()
    imagesRef.current = new Array(FRAME_COUNT)

    // Preload frame 1 first
    const first = new Image()
    first.onload = () => {
      imagesRef.current[0] = first
      setCanvasSize()
      drawFrame(0)
      requestAnimationFrame(() => drawFrame(0))
      // Lazy-load rest
      for (let i = 1; i < FRAME_COUNT; i++) {
        const idx = i
        const im = new Image()
        im.src = FRAME_PATH(idx)
        imagesRef.current[idx] = im
      }
    }
    first.src = FRAME_PATH(0)

    const onScroll = () => {
      const rect = hero.getBoundingClientRect()
      const heroHeight = hero.offsetHeight - window.innerHeight
      const progress = Math.min(Math.max(-rect.top / heroHeight, 0), 1)
      const frameIdx = Math.round(progress * (FRAME_COUNT - 1))
      if (frameIdx !== currentFrameRef.current) {
        currentFrameRef.current = frameIdx
        drawFrame(frameIdx)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', () => {
      setCanvasSize()
      drawFrame(currentFrameRef.current)
    })
    window.addEventListener('load', () => {
      setCanvasSize()
      drawFrame(currentFrameRef.current)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative h-[150vh] bg-navy-dark"
      aria-label="Hero — DMA at Columbia"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(to bottom, rgba(11,42,74,0.55) 0%, rgba(11,42,74,0.78) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-20 h-full container-x flex flex-col justify-center pt-32 pb-16 max-w-4xl">
          <p
            className="eyebrow text-saffron mb-6 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <T
              en="Asociación Médica Dominicana · New York · Est. 1997"
              es="Asociación Médica Dominicana · Nueva York · Desde 1997"
            />
          </p>

          <h1
            className="text-cream text-balance text-[clamp(40px,7vw,84px)] font-medium leading-[1.05] mb-8 animate-fade-up"
            style={{ animationDelay: '0.45s', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}
          >
            <T
              en={<>Médicos unidos en <em>esfuerzos</em> y avances para la comunidad.</>}
              es={<>Médicos unidos en <em>esfuerzos</em> y avances para la comunidad.</>}
            />
          </h1>

          <p
            className="text-cream/85 text-lg md:text-xl max-w-2xl mb-10 animate-fade-up"
            style={{ animationDelay: '0.6s' }}
          >
            <T
              en="Doctors united in service to the Northern Manhattan community. Twenty-eight years mentoring International Medical Graduates of every nationality, connecting patients with bilingual physicians, and bringing care home to the Dominican Republic."
              es="Médicos unidos en servicio a la comunidad del Norte de Manhattan. Veintiocho años mentorizando médicos formados en el extranjero de todas las nacionalidades, conectando pacientes con médicos bilingües, y llevando atención médica a la República Dominicana."
            />
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-up"
            style={{ animationDelay: '0.75s' }}
          >
            <Link href="/get-involved" className="btn-primary">
              <T en="Become a Member" es="Únete" />
              <span aria-hidden>→</span>
            </Link>
            <Link href="/directory" className="btn-glass">
              <T en="Find a Doctor" es="Encuentra un Médico" />
            </Link>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-3 text-cream/70 animate-fade-up" style={{ animationDelay: '1.2s' }}>
            <span className="eyebrow text-[10px]">SCROLL</span>
            <span className="block w-px h-8 bg-cream/40 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}
