import type { CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'

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
      className="relative w-full min-h-screen"
      style={{
        background: 'var(--ll-bg)',
        padding: 'var(--ll-hero-frame-pad)',
        transition: 'padding 0.55s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.55s ease',
      }}
    >
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-24 text-white"
        style={{
          background: '#08191d',
          borderRadius: 'var(--ll-hero-frame-radius)',
          minHeight: 'calc(100vh - 2 * var(--ll-hero-frame-pad))',
          transition: 'border-radius 0.55s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
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
              'radial-gradient(125% 85% at 50% -8%, var(--ll-overlay-radial-1) 0%, var(--ll-overlay-radial-2) 52%, var(--ll-overlay-radial-3) 100%)',
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
              'radial-gradient(circle, var(--ll-halo-accent-strong), transparent 62%)',
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
              'radial-gradient(circle, var(--ll-halo-dot), transparent 60%)',
            transform: 'translate(-50%, -50%)',
            animation: 'av-drift-2 22s ease-in-out infinite',
          }}
        />

        <div className="relative z-10 mt-12 flex max-w-5xl flex-col items-center text-center">
          <h1 className="mb-6 text-[clamp(2rem,5vw,4rem)] font-light leading-[1.1] tracking-tight text-balance text-white">
            <span className="block" style={heroRiseStyle(0.2)}>
              Conduza, acompanhe e enxergue
            </span>
            <span className="block" style={heroRiseStyle(0.4)}>
              toda a <span className="whitespace-nowrap">imunoterapia alérgica</span>{' '}
              <span className="font-semibold">em um só lugar.</span>
            </span>
          </h1>

          <p
            className="max-w-2xl text-[clamp(0.95rem,1.6vw,1.2rem)] font-light leading-relaxed text-white/70"
            style={heroRiseStyle(0.7)}
          >
            Do protocolo à evolução do paciente, do prontuário aos indicadores — a Allervia
            reúne a operação clínica num único fluxo, em constante evolução.
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
              className="group inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 no-underline"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
                color: '#06232a',
                boxShadow:
                  '0 12px 28px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              Começar agora
              <ArrowUpRight
                size={16}
                strokeWidth={2.25}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-medium backdrop-blur-xl transition-all hover:-translate-y-0.5 no-underline"
              style={{
                background: 'rgba(8,25,29,0.85)',
                border: '1px solid rgba(220,225,229,0.13)',
                color: '#DCE1E5',
              }}
            >
              Entrar
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
