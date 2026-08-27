import { faArrowRight, faChartColumn, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import proArt from '@/assets/pro-art.jpg'
import { CircleButton, SHOWCASE } from '@/shared/components/showcase'

interface PromoBar {
  label: string
  caption: string
  ratio: number
  accent: boolean
}

interface PromoCardProps {
  inductionCount: number
  maintenanceCount: number
  bars: PromoBar[]
  onDismiss: () => void
  onOpen: () => void
}

export function PromoCard({ inductionCount, maintenanceCount, bars, onDismiss, onOpen }: PromoCardProps) {
  return (
    <section
      className="relative flex h-full flex-col overflow-hidden rounded-3xl"
      style={{ background: SHOWCASE.card, border: `1px solid ${SHOWCASE.line}` }}
    >
      <img src={proArt} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

      <header className="relative z-20 flex items-start justify-between gap-3 px-5 pt-5">
        <h2 className="text-[1.05rem] font-semibold" style={{ color: SHOWCASE.ink }}>
          Allervia Pro
        </h2>
        <CircleButton icon={faXmark} size={32} iconSize={11} onClick={onDismiss} aria-label="Dispensar" />
      </header>

      <div className="relative z-10 mt-auto px-2.5 pt-2.5 pb-12">
        <div
          className="rounded-[1.35rem] p-4 backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.24)', border: '1px solid rgba(255,255,255,0.42)' }}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                style={{ background: 'rgba(18,51,58,0.08)', color: SHOWCASE.ink }}
              >
                <FontAwesomeIcon icon={faChartColumn} style={{ fontSize: 12 }} />
              </span>
              <div>
                <div className="text-[0.95rem] font-semibold leading-tight" style={{ color: SHOWCASE.ink }}>
                  Vantagens
                </div>
                <div className="text-[0.62rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
                  Sua carteira sob protocolo ativo
                </div>
              </div>
            </div>
            <CircleButton icon={faArrowRight} iconRotateDeg={-45} size={30} iconSize={10} onClick={onOpen} aria-label="Abrir detalhes" />
          </div>

          <div className="flex items-baseline justify-between gap-3 mb-4">
            <div className="flex items-baseline gap-1.5" style={{ color: SHOWCASE.ink }}>
              <span className="text-[2rem] font-semibold leading-none tracking-tight tabular-nums">{inductionCount}</span>
              <span className="text-[0.72rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
                indução
              </span>
            </div>
            <div className="flex items-baseline gap-1.5" style={{ color: SHOWCASE.ink }}>
              <span className="text-[2rem] font-semibold leading-none tracking-tight tabular-nums">{maintenanceCount}</span>
              <span className="text-[0.72rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
                manutenção
              </span>
            </div>
          </div>

          <div className="flex items-end gap-2 h-32">
            {bars.map((bar) => (
              <div
                key={bar.label + bar.caption}
                className="flex-1 rounded-xl px-2.5 pt-2.5"
                style={{
                  height: `${Math.round(bar.ratio * 100)}%`,
                  background: bar.accent ? SHOWCASE.accent : 'rgba(255,255,255,0.34)',
                }}
              >
                <div
                  className="text-[0.72rem] font-bold leading-tight tabular-nums"
                  style={{ color: bar.accent ? SHOWCASE.onAccent : SHOWCASE.ink }}
                >
                  {bar.label}
                </div>
                <div
                  className="text-[0.58rem] font-medium"
                  style={{ color: bar.accent ? 'rgba(255,255,255,0.72)' : SHOWCASE.muted }}
                >
                  {bar.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
