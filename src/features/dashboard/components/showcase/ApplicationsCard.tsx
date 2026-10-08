import { useState } from 'react'
import { faChevronLeft, faChevronRight, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { Card, CardHeader, CircleButton, DayAxis, SHOWCASE, StatValue } from '@/shared/components/showcase'
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
  const peakIndex = slice.reduce(
    (best, entry, i) => (entry.value > slice[best].value ? i : best),
    0,
  )
  const peakValue = slice[peakIndex]?.value ?? 0
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
    <Card tone="plain">
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

      <div className="flex flex-1 flex-col gap-4 min-h-0">
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2.5 whitespace-nowrap">
              <StatValue value={total.toLocaleString('pt-BR')} className="text-[2.4rem]" />
              {[
                { label: 'SCIT', value: subcutaneous, color: MODALITY_COLORS.subcutaneous },
                { label: 'SLIT', value: sublingual, color: MODALITY_COLORS.sublingual },
              ].map((row) => (
                <span
                  key={row.label}
                  className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-medium leading-none first:ml-3"
                  style={{
                    background: `${row.color}26`,
                    border: `1px solid ${row.color}`,
                    color: SHOWCASE.ink,
                    marginTop: 10,
                  }}
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
            <span className="text-[0.82rem] font-medium" style={{ color: SHOWCASE.muted }}>
              {selectedEntry ? 'Aplicações no dia' : 'Aplicações totais no período'}
            </span>
          </div>

          {doseMix.length > 0 && (
            <div className="ml-auto flex max-h-16 min-w-0 flex-col gap-1 overflow-y-auto pb-1">
              {doseMix.map((dose) => (
                <div key={dose.label} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-[0.66rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
                    {dose.label}
                  </span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: SHOWCASE.cardInner }}>
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${Math.max(dose.pct, 4)}%`, background: SHOWCASE.accent }}
                    />
                  </div>
                  <span className="w-8 text-right text-[0.66rem] font-medium tabular-nums" style={{ color: SHOWCASE.ink }}>
                    {Math.round((total * dose.pct) / 100)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center gap-2 min-h-32">
          <CircleButton
            icon={faChevronLeft}
            size={28}
            iconSize={9}
            disabled={!canStepWeek(-1)}
            className={canStepWeek(-1) ? undefined : 'opacity-35'}
            onClick={() => stepWeek(-1)}
            aria-label="Semana anterior"
          />

          <div className={cn('relative flex h-full flex-1 items-end pt-7', slice.length > 14 ? 'gap-1' : 'gap-2.5')}>
            {slice.map((entry, i) => {
              const isToday = i === currentIndex
              const isHovered = hover === i
              const isSelected = selectedIndex === i
              const isPeak = i === peakIndex && peakValue > 0
              const highlighted = isSelected || isHovered || (isPeak && selectedIndex < 0 && hover === null)
              const height = Math.max(6, Math.round((entry.value / max) * 100))
              return (
                <div key={`${entry.label}-${i}`} className="relative flex h-full flex-1 flex-col justify-end">
                  {isPeak && hover === null && selectedIndex < 0 && (
                    <div className="absolute inset-x-0 -top-1 flex justify-center">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-1 text-[0.62rem] font-bold tabular-nums backdrop-blur-md"
                        style={{
                          background: 'rgba(255,255,255,0.45)',
                          border: '1px solid rgba(255,255,255,0.65)',
                          color: SHOWCASE.ink,
                        }}
                      >
                        {peakValue.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn('w-full transition-colors duration-150', slice.length > 30 ? 'rounded-sm' : 'rounded-md')}
                    style={{
                      height: `${height}%`,
                      backgroundColor: highlighted ? SHOWCASE.accent : SHOWCASE.cardInner,
                      outline: isToday && !highlighted ? `1px dashed ${SHOWCASE.muted}` : undefined,
                      outlineOffset: isToday && !highlighted ? '-1px' : undefined,
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
                topPct={100 - Math.max(6, Math.round((hovered.value / max) * 100))}
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
    </Card>
  )
}
