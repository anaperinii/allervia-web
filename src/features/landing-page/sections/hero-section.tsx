import type { CSSProperties } from 'react'
import { AuroraBackground } from '@/features/landing-page/components/aurora-background'
import { PatientChartTablet } from '@/features/landing-page/components/patient-chart-tablet'

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

const letter3DStyle: CSSProperties = {
  display: 'inline-block',
  transformStyle: 'preserve-3d',
  perspective: '400px',
  transformOrigin: 'center center',
  animation:
    'letter-3d-tilt 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both, ' +
    'letter-spin 5s linear 1.8s infinite',
}

const titleTextShadow = '0 0 24px rgba(15, 118, 110, 0.15), 0 2px 4px rgba(15, 23, 42, 0.08)'

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-16 overflow-x-clip px-6 pt-48 pb-20 text-slate-900">
      <AuroraBackground />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 z-5"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 60%, rgba(255,255,255,0.92) 100%)',
          backdropFilter: 'blur(10px) saturate(130%)',
          WebkitBackdropFilter: 'blur(10px) saturate(130%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 55%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 55%, black 100%)',
        }}
      />

      <div className="relative z-10 flex max-w-5xl flex-col items-center text-center">
        <h1
          className="mb-5 text-[22px] font-medium leading-[1.1] tracking-tight text-balance text-slate-900 sm:text-5xl sm:leading-[1.05] md:text-6xl"
          style={{ textShadow: titleTextShadow }}
        >
          <span className="block whitespace-nowrap" style={heroRiseStyle(0.1)}>
            <span style={letter3DStyle}>I</span>munoterapia conduzida c<span style={letter3DStyle}>o</span>m clareza.
          </span>
          <span className="block text-lg sm:text-3xl md:text-4xl" style={heroRiseStyle(0.6)}>
            <span className="shimmer-text">Cuidado contínuo, decisões precisas.</span>
          </span>
        </h1>

        <div
          aria-hidden="true"
          className="mt-4 h-px w-48"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, rgba(100, 116, 139, 0.55) 50%, transparent 100%)',
            ...socialRiseStyle(1.4),
          }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-4xl"
        style={{ ...heroRiseStyle(1.9), perspective: '1400px', perspectiveOrigin: '50% 50%' }}
      >
        <div className="relative" style={{ animation: 'float 7s ease-in-out 2.9s infinite' }}>
          <PatientChartTablet />
        </div>
      </div>
    </section>
  )
}
