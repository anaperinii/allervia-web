import { Reveal } from './Reveal'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import { SPLIT_FEATURES } from '@/features/landing-page/constants/split-features'

const ROTATIONS = [-3, 2, -2.5, 2.5]
const CARD_TONES_LIGHT = ['155,193,196', '108,158,165', '37,126,140', '20,74,86']
const CARD_TONES_DARK = ['155,193,196', '108,158,165', '74,163,175', '96,168,178']

export function SplitSection() {
  const { theme } = useLandingTheme()
  const darkTheme = theme === 'dark'
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
          Na prática
          <span className="opacity-45">]</span>
        </span>
        <h2
          className="text-[clamp(1.8rem,3.6vw,3rem)] font-medium tracking-tight leading-[1.1]"
          style={{ color: 'var(--ll-ink)' }}
        >
          Quatro pilares. <span className="font-semibold">Um só fluxo clínico.</span>
        </h2>
        <p
          className="text-base leading-[1.7] mt-5 max-w-130 mx-auto"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          Do protocolo ao acompanhamento longitudinal, tudo o que sustenta o ciclo
          imunoterápico reunido em um só fluxo — sem partes desconectadas.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 max-w-7xl mx-auto items-stretch">
        {SPLIT_FEATURES.map((feature, index) => {
          const tones = darkTheme ? CARD_TONES_DARK : CARD_TONES_LIGHT
          const tone = tones[index] ?? tones[0]
          const numOpacity = darkTheme
            ? index === 3
              ? 0.42
              : 0.3
            : index >= 2
              ? 0.17
              : 0.28
          const edgeAlpha = darkTheme ? 0.95 : index >= 2 ? 0.68 : 0.95
          return (
          <Reveal key={feature.title} delay={index * 120} threshold={0.2} className="h-full">
            <div
              className="group relative h-full overflow-hidden rounded-2xl p-7 pt-16 transition-transform duration-300 ease-out hover:rotate-0 hover:-translate-y-1.5"
              style={{
                background: 'var(--ll-surface-grad)',
                border: '1px solid var(--ll-border)',
                boxShadow: 'var(--ll-shadow-card-soft)',
                transform: `rotate(${ROTATIONS[index] ?? 0}deg)`,
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
                style={{
                  padding: '1.5px',
                  background: `linear-gradient(135deg, rgba(${tone},${edgeAlpha}) 0%, rgba(${tone},0) 40%, rgba(${tone},0) 60%, rgba(${tone},${edgeAlpha}) 100%)`,
                  WebkitMask:
                    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute select-none font-bold tabular-nums leading-none"
                style={{
                  top: '-0.26em',
                  left: '0.04em',
                  fontSize: '7.5rem',
                  letterSpacing: '-0.05em',
                  color: `rgb(${tone})`,
                  opacity: numOpacity,
                }}
              >
                {index + 1}
              </span>
              <h4 className="relative z-10 text-[1.05rem] font-semibold mb-2" style={{ color: 'var(--ll-ink)' }}>
                {feature.title}
              </h4>
              <p className="relative z-10 text-[0.9rem] leading-[1.65]" style={{ color: 'var(--ll-ink-muted)' }}>
                {feature.description}
              </p>
            </div>
          </Reveal>
          )
        })}
      </div>
    </section>
  )
}
