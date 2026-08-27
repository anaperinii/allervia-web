import type { CSSProperties } from 'react'
import { Link } from '@tanstack/react-router'
import { Aurora, AURORA_STOPS } from '@/shared/components/Aurora'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

const heroRiseStyle = (delay: number): CSSProperties => ({
  opacity: 0,
  filter: 'blur(18px)',
  transform: 'translateY(28px)',
  animation: `hero-rise 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
})

const socialRiseStyle = (delay: number): CSSProperties => ({
  opacity: 0,
  filter: 'blur(8px)',
  transform: 'translateY(14px)',
  animation: `social-rise 0.8s ease-out ${delay}s forwards`,
})

export const HERO_PLATE =
  'linear-gradient(to bottom, #ffffff 0%, #eef2f3 18%, #b9c8cb 46%, #46707a 74%, #0d2f36 92%, #08191d 100%)'

export function HeroSection() {
  return (
    <section
      className="relative w-full min-h-screen"
      style={{
        background: 'var(--ll-bg)',
        padding: 'var(--ll-hero-frame-pad)',
        transition: 'padding 0.55s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.55s ease',
      }}
    >
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24"
        style={{
          background: HERO_PLATE,
          borderRadius: 'var(--ll-hero-frame-radius)',
          minHeight: 'calc(100vh - 2 * var(--ll-hero-frame-pad))',
          transition: 'border-radius 0.55s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[62%]"
          style={{
            zIndex: 0,
            transform: 'scaleY(-1)',
            filter: 'brightness(0.42) saturate(1.4)',
            maskImage:
              'radial-gradient(88% 155% at 50% 100%, transparent 0%, transparent 56%, rgba(0,0,0,0.6) 72%, #000 90%)',
            WebkitMaskImage:
              'radial-gradient(88% 155% at 50% 100%, transparent 0%, transparent 56%, rgba(0,0,0,0.6) 72%, #000 90%)',
          }}
        >
          <Aurora
            colorStops={AURORA_STOPS.dark}
            amplitude={1.1}
            blend={0.6}
            speed={0.7}
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            zIndex: 2,
            backgroundImage:
              'radial-gradient(rgba(220,225,229,0.06) 0.5px, transparent 0.5px)',
            backgroundSize: '3px 3px',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            zIndex: 2,
            top: '78%',
            left: '30%',
            width: '60vmax',
            height: '60vmax',
            background: 'radial-gradient(circle, rgba(155,193,196,0.14), transparent 62%)',
            transform: 'translate(-50%, -50%)',
            animation: 'av-drift-2 22s ease-in-out infinite',
          }}
        />

        <div className="relative z-10 mt-14 flex max-w-5xl flex-col items-center text-center">
          <h1
            className="mb-6 text-[clamp(2rem,5vw,4rem)] font-normal leading-[1.1] tracking-tight text-balance"
            style={{ color: '#0E2E34' }}
          >
            <span className="block" style={heroRiseStyle(0.2)}>
              Conduza, acompanhe e enxergue
            </span>
            <span className="block" style={heroRiseStyle(0.4)}>
              toda a <span className="whitespace-nowrap">imunoterapia alérgica</span>{' '}
              <span
                className="font-semibold"
                style={{
                  backgroundImage:
                    'linear-gradient(115deg, #0E2E34 0%, #0E2E34 42%, #4d7e85 49%, #7fa9ae 51%, #4d7e85 53%, #0E2E34 60%, #0E2E34 100%)',
                  backgroundSize: '300% 100%',
                  backgroundPosition: '200% 0',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  animation: 'shimmer 10s linear infinite',
                  willChange: 'background-position',
                }}
              >
                em um só lugar.
              </span>
            </span>
          </h1>

          <p
            className="max-w-2xl text-[clamp(0.95rem,1.6vw,1.2rem)] font-semibold leading-relaxed"
            style={{ ...heroRiseStyle(0.7), color: 'rgba(14,46,52,0.72)' }}
          >
            Do protocolo à evolução do paciente, do prontuário aos indicadores: o Allervia
            reúne a operação clínica num único fluxo, em constante evolução.
          </p>

          <div className="mt-9" style={socialRiseStyle(1.2)}>
            <Link
              to="/trial"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold no-underline transition-all hover:-translate-y-0.5"
              style={{
                background: '#12333a',
                color: '#ffffff',
                border: '2px solid #12333a',
                boxShadow: '0 8px 24px rgba(14,46,52,0.22)',
              }}
            >
              Começar agora
              <FontAwesomeIcon
                icon={faChevronRight}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ fontSize: 16 }}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
