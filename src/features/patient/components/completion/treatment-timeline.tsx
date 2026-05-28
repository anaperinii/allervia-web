import { useMemo, useState } from 'react'
import { differenceInDays } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { parsePtDate, comparePtDateAsc, formatDurationFromDays } from '@/shared/lib/dates'
import { isMaintenanceApplication } from '@/features/patient/lib/patient-phases'
import type { Application } from '@/features/patient/stores/patient-store'

interface TreatmentTimelineProps {
  applications: Application[]
  inductionStart: string
  maintenanceStart: string | null
}

type DotKind = 'induction' | 'maintenance' | 'reaction' | 'today'

interface Dot {
  kind: DotKind
  date: Date
  label: string
  dose: string
}

interface KindStyle {
  bg: string
  ring: string
  legendBg?: string
  legendText?: string
  legendBorder?: string
}

const KIND_STYLES: Record<DotKind, KindStyle> = {
  induction:   { bg: 'bg-teal-300',   ring: 'ring-teal-100',   legendBg: 'bg-teal-50',   legendText: 'text-teal-700',   legendBorder: 'border-teal-200' },
  maintenance: { bg: 'bg-brand',      ring: 'ring-teal-200',   legendBg: 'bg-teal-100',  legendText: 'text-teal-800',   legendBorder: 'border-teal-300' },
  reaction:    { bg: 'bg-orange-500', ring: 'ring-orange-200', legendBg: 'bg-orange-50', legendText: 'text-orange-700', legendBorder: 'border-orange-200' },
  today:       { bg: 'bg-gray-400',   ring: 'ring-gray-200' },
}

export function TreatmentTimeline({ applications, inductionStart, maintenanceStart }: TreatmentTimelineProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const { dots, induction, maintenanceStartIdx } = useMemo(() => {
    const realized = applications
      .filter((application) => application.status === 'completed')
      .sort((a, b) => comparePtDateAsc(a.date, b.date))

    const induction = realized.filter((application) => !isMaintenanceApplication(application))
    const maintenanceStartIdx = realized.findIndex(isMaintenanceApplication)

    const dots: Dot[] = realized.map((application) => ({
      kind: application.sideEffect === 'yes' ? 'reaction' : isMaintenanceApplication(application) ? 'maintenance' : 'induction',
      date: parsePtDate(application.date),
      label: application.date,
      dose: application.dose,
    }))

    const today = new Date()
    dots.push({
      kind: 'today',
      date: today,
      label: 'Hoje',
      dose: '',
    })

    return { dots, induction, maintenanceStartIdx }
  }, [applications])

  const realizedCount = dots.length - 1
  const inductionPct = realizedCount ? Math.round((induction.length / realizedCount) * 100) : 0
  const maintenancePct = 100 - inductionPct

  const today = new Date()
  const inductionStartDate = inductionStart && inductionStart !== '—' ? parsePtDate(inductionStart) : null
  const maintenanceStartDate = maintenanceStart ? parsePtDate(maintenanceStart) : null
  const inductionDurationLabel = inductionStartDate
    ? formatDurationFromDays(differenceInDays(maintenanceStartDate ?? today, inductionStartDate))
    : '—'
  const maintenanceDurationLabel = maintenanceStartDate
    ? formatDurationFromDays(differenceInDays(today, maintenanceStartDate))
    : null

  const denom = Math.max(dots.length - 1, 1)
  const positionOf = (i: number) => (i / denom) * 100
  const maintenanceLabelPct = maintenanceStartIdx >= 0 ? positionOf(maintenanceStartIdx) : null

  return (
    <div className="border border-(--border-custom) rounded-xl bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[0.7rem] font-bold text-(--text) uppercase tracking-wider">Linha do tempo do tratamento</div>
          <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
            {realizedCount} {realizedCount === 1 ? 'aplicação realizada' : 'aplicações realizadas'} · de {inductionStart} até hoje
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LegendBadge kind="induction" label={`Indução · ${inductionDurationLabel}`} />
          {maintenanceDurationLabel && <LegendBadge kind="maintenance" label={`Manutenção · ${maintenanceDurationLabel}`} />}
          <LegendBadge kind="reaction" label="Reação adversa" />
        </div>
      </div>

      <div className="relative">
        <div className="relative h-10">
          <div className="absolute inset-0 flex rounded-lg overflow-hidden">
            {realizedCount > 0 && inductionPct > 0 ? (
              <>
                <div className="bg-teal-50" style={{ width: `${inductionPct}%` }} title="Fase de indução" />
                <div className="bg-teal-200/80" style={{ width: `${maintenancePct}%` }} title="Fase de manutenção" />
              </>
            ) : (
              <div className="bg-gray-50 w-full" />
            )}
          </div>
          <div className="absolute top-1/2 left-3 right-3 h-0.5 -translate-y-1/2 bg-gray-300 rounded-full" />
          <div className="absolute inset-y-0 left-3 right-3">
            {dots.map((dot, i) => (
              <TimelineDot
                key={i}
                dot={dot}
                left={positionOf(i)}
                index={i}
                isHovered={hovered === i}
                onHoverChange={setHovered}
              />
            ))}
          </div>
          {dots.length === 1 && (
            <div className="absolute inset-0 flex items-center justify-center text-[0.65rem] text-(--text-muted)">
              Sem aplicações realizadas anteriores.
            </div>
          )}
        </div>

        <div className="relative h-3 mt-1 text-[0.55rem] font-semibold text-(--text-muted)">
          <span className="absolute left-0">Início · {inductionStart}</span>
          {maintenanceStart && maintenanceLabelPct != null && maintenanceLabelPct > 15 && maintenanceLabelPct < 85 && (
            <span className="absolute -translate-x-1/2" style={{ left: `${maintenanceLabelPct}%` }}>
              Manutenção · {maintenanceStart}
            </span>
          )}
          <span className="absolute right-0">Hoje</span>
        </div>
      </div>
    </div>
  )
}

interface TimelineDotProps {
  dot: Dot
  left: number
  index: number
  isHovered: boolean
  onHoverChange: (index: number | null) => void
}

function TimelineDot({ dot, left, index, isHovered, onHoverChange }: TimelineDotProps) {
  const styles = KIND_STYLES[dot.kind]
  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-0 duration-500"
      style={{ left: `${left}%`, animationDelay: `${Math.min(index * 35, 1800)}ms`, animationFillMode: 'backwards' }}
      onMouseEnter={() => onHoverChange(index)}
      onMouseLeave={() => onHoverChange(null)}
    >
      <button
        type="button"
        aria-label={dot.dose ? `${dot.label} · ${dot.dose}` : dot.label}
        onFocus={() => onHoverChange(index)}
        onBlur={() => onHoverChange(null)}
        className={cn(
          'h-3 w-3 rounded-full transition-all cursor-pointer ring-2 ring-white hover:ring-4 focus:ring-4 focus:outline-none block',
          styles.bg,
          isHovered && 'h-3.5 w-3.5',
        )}
      />
      {isHovered && (
        <div role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap pointer-events-none">
          <div className="text-[0.55rem] font-medium rounded-md px-2 py-1 shadow-lg bg-(--text) text-white">
            <div className="font-semibold">{dot.label}</div>
            {dot.dose && <div className="opacity-90">{dot.dose}</div>}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-(--text)" />
        </div>
      )}
    </div>
  )
}

function LegendBadge({ kind, label }: { kind: DotKind; label: string }) {
  const s = KIND_STYLES[kind]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[0.55rem] font-semibold rounded-full border px-2 py-0.5', s.legendBg, s.legendText, s.legendBorder)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.bg)} />
      {label}
    </span>
  )
}
