import { Reveal } from './Reveal'
import { SPLIT_FEATURES } from '@/features/landing-page/constants/split-features'

const TONES = [
  'var(--ll-ink)',
  'var(--ll-accent-strong)',
  'var(--ll-ink-muted)',
  'var(--ll-ink-tertiary)',
]

export function SplitSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden py-28 px-[5%]"
      style={{ background: 'var(--ll-bg)' }}
    >
      <Reveal className="text-center max-w-4xl mx-auto mb-20">
        <span
          className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full mb-5"
          style={{
            color: 'var(--ll-accent-strong)',
            border: '1px solid var(--ll-accent-border-soft)',
          }}
        >
          Como funciona
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto">
        {SPLIT_FEATURES.map((feature, index) => (
          <Reveal
            key={feature.title}
            delay={index * 120}
            threshold={0.2}
            className="relative pt-7"
            style={{ borderTop: '1px solid var(--ll-border)' }}
          >
            <span
              className="block tabular-nums leading-none mb-7"
              style={{
                color: TONES[index] ?? TONES[TONES.length - 1],
                fontSize: '2.8rem',
                fontWeight: 700,
                letterSpacing: '-0.04em',
              }}
            >
              {String(index + 1).padStart(2, '0')}.
            </span>
            <h4 className="text-[1.05rem] font-semibold mb-2" style={{ color: 'var(--ll-ink)' }}>
              {feature.title}
            </h4>
            <p className="text-[0.9rem] leading-[1.65]" style={{ color: 'var(--ll-ink-muted)' }}>
              {feature.description}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
