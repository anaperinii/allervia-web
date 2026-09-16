import { useState } from 'react'
import { Reveal } from './Reveal'
import { CardSwap, Card } from '@/shared/components/CardSwap'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import { SPLIT_FEATURES } from '@/features/landing-page/constants/split-features'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

const CARD_TONES_LIGHT = ['155,193,196', '108,158,165', '37,126,140', '20,74,86']
const CARD_TONES_DARK = ['155,193,196', '108,158,165', '74,163,175', '96,168,178']

const THUMB_ANGLES = ['120% 90% at 22% 92%', '110% 95% at 78% 88%', '120% 90% at 50% 100%', '115% 95% at 12% 78%']

export function SplitSection() {
  const { theme } = useLandingTheme()
  const darkTheme = theme === 'dark'
  const [active, setActive] = useState(0)
  const tones = darkTheme ? CARD_TONES_DARK : CARD_TONES_LIGHT
  const next = () => setActive((i) => (i + 1) % SPLIT_FEATURES.length)

  const glowAlpha = darkTheme ? [0.85, 0.35] : [0.5, 0.2]
  const plateMid = darkTheme ? 'rgba(15,58,66,0.92)' : 'rgba(219,231,232,0.94)'
  const plateEnd = darkTheme ? '#08191d' : '#f4f8f8'
  const cardInk = darkTheme ? '#e9f2f1' : '#0E2E34'
  const cardInkMuted = darkTheme ? 'rgba(233,242,241,0.8)' : 'rgba(14,46,52,0.75)'
  const cardScrim = darkTheme
    ? 'linear-gradient(to top, rgba(6,20,23,0.62) 0%, rgba(6,20,23,0.28) 55%, rgba(6,20,23,0) 100%)'
    : 'linear-gradient(to top, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.34) 55%, rgba(255,255,255,0) 100%)'
  const badgeBg = darkTheme ? '#e9f2f1' : '#0E2E34'
  const badgeInk = darkTheme ? '#0E2E34' : '#e9f2f1'
  const badgeBd = darkTheme ? 'rgba(14,46,52,0.18)' : 'rgba(233,242,241,0.20)'
  const dotIdleBd = darkTheme ? 'var(--ll-border)' : 'rgba(37,126,140,0.5)'
  const dotActiveShadow = darkTheme
    ? '0 2px 12px rgba(108,158,165,0.3)'
    : '0 2px 12px rgba(108,158,165,0.3), 0 0 0 1.5px rgba(37,126,140,0.35)'

  return (
    <section
      id="about"
      className="relative overflow-hidden py-28 px-[5%]"
      style={{ background: 'var(--ll-bg)' }}
      >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)] lg:gap-14">
        <Reveal className="max-w-xl">
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
            Quatro pilares.{' '}
            <span className="font-semibold" style={{ color: 'var(--ll-accent-strong)' }}>
              Um só fluxo clínico.
            </span>
          </h2>
          <p
            className="text-base leading-[1.7] mt-5"
            style={{ color: 'var(--ll-ink-muted)' }}
          >
            Do protocolo ao acompanhamento longitudinal, tudo o que sustenta o ciclo
            imunoterápico reunido em um só fluxo — sem partes desconectadas.
          </p>

          <div className="mt-9 flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              {SPLIT_FEATURES.map((feature, index) => {
                const isActive = index === active
                return (
                  <button
                    key={feature.title}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={feature.title}
                    aria-current={isActive || undefined}
                    className="flex h-6 w-6 items-center justify-center cursor-pointer"
                  >
                    <span
                      className="rounded-full transition-all duration-300"
                      style={
                        isActive
                          ? {
                              height: '13px',
                              width: '13px',
                              background:
                                'linear-gradient(to bottom right, var(--color-brand), var(--color-brand-dark))',
                              boxShadow: dotActiveShadow,
                            }
                          : {
                              height: '7px',
                              width: '7px',
                              background:
                                'linear-gradient(var(--ll-surface), var(--ll-surface)), var(--ll-bg)',
                              border: `1px solid ${dotIdleBd}`,
                            }
                      }
                    />
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Próximo pilar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-colors duration-200"
              style={{
                border: '1.5px solid var(--ll-border-strong)',
                background: 'transparent',
                color: 'var(--ll-ink)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--ll-accent-bg-soft)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} />
            </button>
          </div>
        </Reveal>

      <Reveal className="flex w-full flex-col items-center gap-9 lg:items-start" threshold={0.2}>
        <div className="w-full pr-10 pt-12">
          <CardSwap
            width="min(100%, 36rem)"
            height="clamp(15rem, 26vw, 19rem)"
            cardDistance={44}
            verticalDistance={50}
            skewAmount={4}
            active={active}
            onCardClick={(i) => setActive(i)}
            className="mx-auto"
          >
            {SPLIT_FEATURES.map((feature, index) => {
              const tone = tones[index] ?? tones[0]
              const angle = THUMB_ANGLES[index] ?? THUMB_ANGLES[0]
              return (
                <Card
                  key={feature.title}
                  className="flex cursor-pointer flex-col justify-end p-8"
                  style={{
                    background: `radial-gradient(${angle}, rgba(${tone},${glowAlpha[0]}) 0%, rgba(${tone},${glowAlpha[1]}) 38%, ${plateMid} 78%, ${plateEnd} 100%)`,
                    border: '1px solid var(--ll-border)',
                  }}
                  >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%]"
                    style={{
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      background: cardScrim,
                      maskImage: 'linear-gradient(to top, #000 0%, #000 45%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 45%, transparent 100%)',
                    }}
                  />
                  <div className="relative z-10">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[0.78rem] font-semibold tabular-nums"
                      style={{ background: badgeBg, border: `1px solid ${badgeBd}`, color: badgeInk }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h4 className="mt-3 text-[1.35rem] font-medium tracking-tight" style={{ color: cardInk }}>
                      {feature.title}
                    </h4>
                    <p className="mt-2 text-[0.92rem] leading-[1.6]" style={{ color: cardInkMuted }}>
                      {feature.description}
                    </p>
                  </div>
                </Card>
              )
            })}
          </CardSwap>
        </div>

      </Reveal>
      </div>
    </section>
  )
}
