import type { CSSProperties } from 'react'
import { AuroraBackground } from '@/features/landing-page/components/AuroraBackground'
import { Reveal } from '@/features/landing-page/components/Reveal'
import { TechBadge } from '@/presentation/slides/TechBadge'
import { TECH_CATEGORIES } from '@/presentation/constants/tech-stack'

const heroRiseStyle = (delay: number): CSSProperties => ({
  opacity: 0,
  filter: 'blur(18px)',
  transform: 'translateY(28px)',
  animation: `hero-rise 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
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

export function TechStackSlide() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-16 overflow-hidden px-6 py-20 text-slate-900">
      <AuroraBackground fadeBottom={false} />

      <div className="relative z-10 flex max-w-5xl flex-col items-center text-center">
        <span
          className="mb-5 inline-block text-[0.78rem] font-bold uppercase tracking-[2.5px] text-teal-600"
          style={heroRiseStyle(0)}
        >
          Stack Tecnológica
        </span>

        <div
          aria-hidden="true"
          className="mx-auto mb-6 h-px w-40"
          style={{
            background: 'linear-gradient(to right, transparent 0%, rgba(100, 116, 139, 0.5) 50%, transparent 100%)',
            ...heroRiseStyle(0.05),
          }}
        />

        <h1
          className="mb-5 text-[26px] font-medium leading-[1.1] tracking-tight text-balance text-slate-900 sm:text-5xl sm:leading-[1.05] md:text-6xl"
          style={{ textShadow: titleTextShadow }}
        >
          <span className="block whitespace-nowrap" style={heroRiseStyle(0.1)}>
            As tecnol<span style={letter3DStyle}>o</span>gias d<span style={letter3DStyle}>o</span> ImuneCare.
          </span>
          <span className="block text-lg sm:text-3xl md:text-4xl" style={heroRiseStyle(0.6)}>
            <span className="shimmer-text">Ferramentas atuais que constroem o produto.</span>
          </span>
        </h1>
      </div>

      <div className="group/stack relative z-10 grid w-full max-w-5xl gap-x-10 gap-y-9 sm:grid-cols-2">
        {TECH_CATEGORIES.map((category, i) => (
          <Reveal key={category.label} delay={i * 90}>
            <div>
              <h2 className="mb-3.5 flex items-center gap-2.5 text-[0.7rem] font-bold uppercase tracking-[2px] text-slate-400">
                <span className="h-px w-5 bg-slate-300" />
                {category.label}
              </h2>
              <div className="flex flex-wrap gap-3">
                {category.items.map((tech) => (
                  <TechBadge key={tech.name} {...tech} />
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
