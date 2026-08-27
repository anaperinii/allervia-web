import { useState } from 'react'
import { faChevronLeft, faChevronRight, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { AccentBadge, Card, CardHeader, CircleButton, DayAxis, SHOWCASE } from '@/shared/components/showcase'
import { axisLabels, todayIndex, useSeriesFilters, windowCaption } from '@/features/dashboard/hooks/useChartWindow'
import { CardFilters } from './CardFilters'
import { ChartTooltip, HoverBands } from './ChartHover'
import { cn } from '@/shared/lib/cn'

const MODALITY_COLORS = {
  subcutaneous: '#B7E06A',
  sublingual: '#74C3B9',
} as const

interface ApplicationsCardProps {
  title: string
  caption: string
  series: { date: string; label: string; value: number }[]
  modalityMix: { subcutaneous: number; sublingual: number; total: number }
  doseMix: { label: string; value: number; pct: number }[]
}

export function ApplicationsCard({ title, caption, series, modalityMix, doseMix }: ApplicationsCardProps) {
  const { slice, filters, active, stepWeek, canStepWeek } = useSeriesFilters(series, { range: true })
  const windowTotal = slice.reduce((sum, entry) => sum + entry.value, 0)
  const max = Math.max(...slice.map((entry) => entry.value), 1)
  const currentIndex = todayIndex(slice)
  const currentValue = slice[currentIndex]?.value ?? 0
  const [hover, setHover] = useState<number | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const selectedIndex = selected ? slice.findIndex((entry) => entry.date === selected) : -1
  const selectedEntry = selectedIndex >= 0 ? slice[selectedIndex] : undefined
  const hovered = hover !== null ? slice[hover] : undefined

  const total = selectedEntry ? selectedEntry.value : windowTotal
  const mixTotal = modalityMix.total || 1
  const subcutaneous = Math.round((total * modalityMix.subcutaneous) / mixTotal)
  const sublingual = total - subcutaneous

  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={selectedEntry ? `Dia ${selectedEntry.label}` : windowCaption(caption, slice)}
        actions={
          <>
            {selectedEntry && (
              <CircleButton
                icon={faRotateRight}
                size={32}
                iconSize={10}
                onClick={() => setSelected(null)}
                aria-label="Limpar seleção do dia"
                title="Limpar seleção do dia"
              />
            )}
            <CardFilters filters={filters} active={active} inline />
          </>
        }
      />

      <div className="flex flex-1 gap-5 min-h-0">
        <div className="flex w-72 shrink-0 flex-col">
          <div className="flex items-center gap-3" style={{ color: SHOWCASE.ink }}>
            <span className="text-[2.35rem] font-semibold leading-none tracking-tight tabular-nums">
              {total.toLocaleString('pt-BR')}
            </span>

            <div className="flex items-center gap-1.5 whitespace-nowrap">
              {[
                { label: 'SCIT', value: subcutaneous, color: MODALITY_COLORS.subcutaneous },
                { label: 'SLIT', value: sublingual, color: MODALITY_COLORS.sublingual },
              ].map((row) => (
                <span
                  key={row.label}
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-medium leading-none"
                  style={{ background: `${row.color}26`, border: `1px solid ${row.color}`, color: SHOWCASE.ink }}
                  title={row.label === 'SCIT' ? 'Subcutânea' : 'Sublingual'}
                >
                  <span className="font-bold tabular-nums">{row.value.toLocaleString('pt-BR')}</span>
                  {row.label}
                  <span className="font-semibold tabular-nums opacity-70">
                    {total > 0 ? Math.round((row.value / total) * 100) : 0}%
                  </span>
                </span>
              ))}
            </div>
          </div>


          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
            <p className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-wide" style={{ color: SHOWCASE.muted }}>
              Doses aplicadas
            </p>
            {doseMix.map((dose) => (
              <div key={dose.label} className="flex shrink-0 items-center gap-2">
                <span className="w-28 shrink-0 truncate text-[0.68rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
                  {dose.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: SHOWCASE.cardInner }}>
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.max(dose.pct, 4)}%`, background: SHOWCASE.ink }}
                  />
                </div>
                <span className="w-8 text-right text-[0.66rem] font-semibold tabular-nums" style={{ color: SHOWCASE.ink }}>
                  {Math.round((total * dose.pct) / 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex flex-1 items-center gap-2 min-h-30">
            <CircleButton
              icon={faChevronLeft}
              size={28}
              iconSize={9}
              disabled={!canStepWeek(-1)}
              className={canStepWeek(-1) ? undefined : 'opacity-35'}
              onClick={() => stepWeek(-1)}
              aria-label="Semana anterior"
            />

            <div className={cn('relative flex h-full flex-1 items-end', slice.length > 14 ? 'gap-0.5' : 'gap-2')}>
              {slice.map((entry, i) => {
                const isToday = i === currentIndex
                const isHovered = hover === i
                const isSelected = selectedIndex === i
                const height = Math.max(8, Math.round((entry.value / max) * 100))
                return (
                  <div key={`${entry.label}-${i}`} className="relative flex h-full flex-1 flex-col justify-end">
                    {isToday && hover === null && (
                      <div className="absolute inset-x-0 -top-1 flex justify-center">
                        <AccentBadge>{currentValue.toLocaleString('pt-BR')}</AccentBadge>
                      </div>
                    )}
                    <div
                      className={cn('w-full transition-colors duration-150', slice.length > 30 ? 'rounded-sm' : 'rounded-lg')}
                      style={{
                        height: `${height}%`,
                        backgroundColor: isSelected
                          ? SHOWCASE.accent
                          : isHovered
                            ? SHOWCASE.accentSoft
                            : isToday
                              ? SHOWCASE.white
                              : SHOWCASE.cardInner,
                        backgroundImage:
                          isToday && !isHovered && !isSelected
                            ? `repeating-linear-gradient(45deg, ${SHOWCASE.ink}42 0 1.4px, transparent 1.4px 6px)`
                            : undefined,
                        border: isToday && !isHovered && !isSelected ? `1px solid ${SHOWCASE.line}` : undefined,
                      }}
                    />
                  </div>
                )
              })}

              <HoverBands
                count={slice.length}
                onHover={setHover}
                onSelect={(index) => setSelected((current) => (current === slice[index].date ? null : slice[index].date))}
              />

              {hovered && hover !== null && (
                <ChartTooltip
                  leftPct={((hover + 0.5) / slice.length) * 100}
                  topPct={100 - Math.max(8, Math.round((hovered.value / max) * 100))}
                  label={hovered.label}
                >
                  {hovered.value.toLocaleString('pt-BR')} aplicações
                </ChartTooltip>
              )}
            </div>

            <CircleButton
              icon={faChevronRight}
              size={28}
              iconSize={9}
              disabled={!canStepWeek(1)}
              className={canStepWeek(1) ? undefined : 'opacity-35'}
              onClick={() => stepWeek(1)}
              aria-label="Próxima semana"
            />
          </div>

          <div className="px-9">
            <DayAxis days={axisLabels(slice.map((entry) => entry.label))} />
          </div>
        </div>
      </div>
    </Card>
  )
}
