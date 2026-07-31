import { Reveal } from './Reveal'
import { SPLIT_FEATURES } from '@/features/landing-page/constants/split-features'

const ROTATIONS = [-3, 2, -2.5, 2.5]

export function SplitSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-28 px-[5%]"
      style={{ background: 'var(--ll-bg)' }}
    >
      <Reveal className="text-center max-w-4xl mx-auto mb-20">
        <span
          className="inline-flex items-center gap-2.5 text-[0.75rem] font-bold tracking-[2px] uppercase mb-5"
          style={{ color: 'var(--ll-accent-strong)' }}
        >
          <span className="opacity-45">[</span>
          Como funciona
          <span className="opacity-45">]</span>
        </span>
        <h2
          className="text-[clamp(1.8rem,3.6vw,3rem)] font-medium tracking-tight leading-[1.1]"
          style={{ color: 'var(--ll-ink)' }}
        >
          Quatro etapas. <span className="font-semibold">Um só ciclo.</span>
        </h2>
        <p
          className="text-base leading-[1.7] mt-5 max-w-130 mx-auto"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          Da definição do protocolo ao acompanhamento longitudinal — controle total do ciclo
          imunoterápico, sem etapas desconectadas.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 max-w-7xl mx-auto items-stretch">
        {SPLIT_FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 120} threshold={0.2} className="h-full">
            <div
              className="group relative h-full rounded-2xl p-7 transition-transform duration-300 ease-out hover:rotate-0 hover:-translate-y-1.5"
              style={{
                background: 'var(--ll-surface-grad)',
                border: '1px solid var(--ll-border)',
                boxShadow: 'var(--ll-shadow-card-soft)',
                transform: `rotate(${ROTATIONS[index] ?? 0}deg)`,
              }}
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-[0.95rem] font-bold tabular-nums mb-6"
                style={{
                  background: 'var(--ll-accent-bg-soft)',
                  color: 'var(--ll-accent-strong)',
                  border: '1px solid var(--ll-accent-border-soft)',
                }}
              >
                {index + 1}
              </span>
              <h4 className="text-[1.05rem] font-semibold mb-2" style={{ color: 'var(--ll-ink)' }}>
                {feature.title}
              </h4>
              <p className="text-[0.9rem] leading-[1.65]" style={{ color: 'var(--ll-ink-muted)' }}>
                {feature.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
