import { useState } from 'react'
import { Reveal } from './Reveal'
import { cn } from '@/shared/lib/cn'
import { useAnimatedNumber } from '@/shared/hooks/useAnimatedNumber'
import { SPLIT_FEATURES } from '@/features/landing-page/constants/split-features'

const PROTOCOL_STAGES = ['1:10.000', '1:1.000', '1:100', '1:10']
const DEFAULT_STAGE_INDEX = 1

export function SplitSection() {
  const [activeStageIndex, setActiveStageIndex] = useState(DEFAULT_STAGE_INDEX)
  const targetPct = Math.round(((activeStageIndex + 1) / PROTOCOL_STAGES.length) * 100)
  const displayPct = useAnimatedNumber(targetPct)

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'var(--ll-bg)' }}>
      <Reveal
        id="about"
        className="grid grid-cols-1 lg:grid-cols-2 gap-[5%] items-center rounded-3xl p-6 sm:p-8 lg:p-16 mx-[5%] relative overflow-hidden"
        style={{
          background: 'var(--ll-surface-grad)',
          border: '1px solid var(--ll-border)',
          boxShadow: 'var(--ll-shadow-card)',
        }}
      >
        <div
          className="rounded-3xl p-8 sm:p-10 min-h-70 sm:min-h-80 flex flex-col justify-between relative overflow-hidden"
          style={{
            background:
              'linear-gradient(150deg, #6C9EA5 0%, #4d7e85 55%, #06232a 100%)',
          }}
        >
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 pointer-events-none"
            style={{
              width: '60%',
              height: '70%',
              backgroundImage:
                'radial-gradient(circle, #DCE1E5 1.4px, transparent 1.9px)',
              backgroundSize: '15px 15px',
              backgroundPosition: 'right top',
              opacity: 0.42,
              WebkitMaskImage:
                'radial-gradient(72% 118% at 100% 0%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
              maskImage:
                'radial-gradient(72% 118% at 100% 0%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute left-0 bottom-0 pointer-events-none"
            style={{
              width: '50%',
              height: '55%',
              backgroundImage:
                'radial-gradient(circle, #DCE1E5 1.4px, transparent 1.9px)',
              backgroundSize: '15px 15px',
              backgroundPosition: 'left bottom',
              opacity: 0.32,
              WebkitMaskImage:
                'radial-gradient(72% 118% at 0% 100%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
              maskImage:
                'radial-gradient(72% 118% at 0% 100%, #000 0%, rgba(0,0,0,0.42) 30%, transparent 62%)',
            }}
          />

          <h3 className="text-xl sm:text-[1.5rem] font-light text-white max-w-72 leading-[1.3] relative z-1 tracking-tight">
            Controle total do ciclo imunoterápico com segurança e clareza
          </h3>

          <div className="relative z-1 mt-8">
            <div className="text-[0.65rem] text-white/70 font-semibold uppercase tracking-wider mb-2.5">Progressão do protocolo</div>
            <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Estágios do protocolo">
              {PROTOCOL_STAGES.map((conc, index) => {
                const isActive = index <= activeStageIndex
                return (
                  <div key={conc} className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveStageIndex(index)}
                      aria-pressed={isActive}
                      aria-label={`Avançar até ${conc}`}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[0.65rem] font-bold backdrop-blur-md border transition-all cursor-pointer focus:outline-none hover:-translate-y-px',
                        isActive
                          ? 'bg-white text-[#06232a] border-white shadow-[0_2px_8px_rgba(255,255,255,0.25)]'
                          : 'bg-white/15 text-white border-white/25 hover:bg-white/25',
                      )}
                    >
                      {conc}
                    </button>
                    {index < PROTOCOL_STAGES.length - 1 && <span className="text-white/50 text-xs">→</span>}
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-[width] duration-500 ease-out" style={{ width: `${displayPct}%` }} />
              </div>
              <span className="text-[0.7rem] font-bold text-white tabular-nums">{displayPct}%</span>
            </div>
          </div>
        </div>

        <div className="py-4">
          {SPLIT_FEATURES.map((feature, index) => {
            const TONES = ['var(--ll-ink)', 'var(--ll-accent-strong)', 'var(--ll-ink-muted)', 'var(--ll-ink-tertiary)']
            return (
              <Reveal
                key={feature.title}
                className="flex gap-5 mb-7 last:mb-0 items-start"
                delay={index * 140}
                threshold={0.25}
              >
                <span
                  className="shrink-0 tabular-nums leading-none"
                  style={{
                    color: TONES[index] ?? TONES[TONES.length - 1],
                    fontSize: '2.6rem',
                    fontWeight: 300,
                    letterSpacing: '-0.04em',
                    minWidth: '3.6rem',
                    marginTop: '0.45rem',
                  }}
                >
                  {String(index + 1).padStart(2, '0')}.
                </span>
                <div className="pt-1">
                  <h4 className="text-[0.95rem] font-semibold mb-1" style={{ color: 'var(--ll-ink)' }}>
                    {feature.title}
                  </h4>
                  <p className="text-[0.85rem] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}
