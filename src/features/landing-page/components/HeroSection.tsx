import type { CSSProperties } from 'react'
import { AllerviaLogo } from '@/features/landing-page/components/AllerviaLogo'

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

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-24 text-white"
      style={{ background: '#08191d' }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/allervia-hero.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            'radial-gradient(125% 85% at 50% -8%, rgba(14,53,61,0.72) 0%, rgba(8,25,29,0.82) 52%, rgba(6,18,21,0.90) 100%)',
        }}
      />

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
          top: '20%',
          left: '50%',
          width: '70vmax',
          height: '70vmax',
          background:
            'radial-gradient(circle, rgba(108,158,165,0.18), transparent 62%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-1 18s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          zIndex: 2,
          top: '60%',
          left: '20%',
          width: '50vmax',
          height: '50vmax',
          background:
            'radial-gradient(circle, rgba(155,193,196,0.12), transparent 60%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-2 22s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex max-w-5xl flex-col items-center text-center">
        <div className="mb-10" style={heroRiseStyle(0.05)}>
          <AllerviaLogo size={64} color="#9BC1C4" />
        </div>

        <h1 className="mb-6 text-[clamp(2rem,5vw,4rem)] font-light leading-[1.1] tracking-tight text-balance">
          <span className="block" style={heroRiseStyle(0.2)}>
            Imunoterapia conduzida
          </span>
          <span className="block font-semibold" style={{ ...heroRiseStyle(0.4), color: '#DCE1E5' }}>
            com clareza.
          </span>
        </h1>

        <p
          className="max-w-2xl text-[clamp(0.95rem,1.6vw,1.2rem)] font-light leading-relaxed"
          style={{ ...heroRiseStyle(0.7), color: '#7FA6AC' }}
        >
          Cuidado contínuo, decisões precisas — a plataforma Allervia integra protocolos, agenda
          e prontuário em um único fluxo clínico.
        </p>

        <div
          aria-hidden="true"
          className="mt-8 h-px w-48"
          style={{
            background:
              'linear-gradient(to right, transparent 0%, rgba(108,158,165,0.5) 50%, transparent 100%)',
            ...socialRiseStyle(1.2),
          }}
        />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4" style={socialRiseStyle(1.4)}>
          <a
            href="/trial"
            className="group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 no-underline"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
              color: '#06232a',
              boxShadow: '0 12px 28px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            Começar agora
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-medium text-white/85 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white no-underline"
          >
            Entrar
          </a>
        </div>
      </div>
    </section>
  )
}
