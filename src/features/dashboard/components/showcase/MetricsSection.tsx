import type { ReactNode } from 'react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import allerviaMark from '@/assets/allervia-mark-light.png'
import { SHOWCASE, StatValue } from '@/shared/components/showcase'
import { cn } from '@/shared/lib/cn'
import type { CardFilter } from '@/features/dashboard/hooks/useChartWindow'
import { CardFilters } from './CardFilters'

export interface Metric {
  label: string
  value: string
  unit?: string
  icon?: IconDefinition
}

interface MetricsSectionProps {
  metrics: Metric[]
  children?: ReactNode
}

export function ChartCard({
  title,
  children,
  fullWidth,
  filters,
  filtersActive,
}: {
  title: string
  children: ReactNode
  fullWidth?: boolean
  filters?: CardFilter[]
  filtersActive?: boolean
}) {
  return (
    <section
      className={cn('flex h-full flex-col rounded-xl p-5', fullWidth && 'col-span-3')}
      style={{ background: SHOWCASE.white, border: `1px solid ${SHOWCASE.line}` }}
    >
      <header className="mb-0 flex items-start justify-between gap-3">
        <h3 className="text-[0.92rem] font-bold" style={{ color: SHOWCASE.ink }}>
          {title}
        </h3>
        {filters && <CardFilters filters={filters} active={filtersActive} inline={fullWidth} />}
      </header>
      <div className="flex flex-1 flex-col min-h-0">{children}</div>
    </section>
  )
}

const ORNAMENTS = [
  { ornament: '-right-7 -top-5 h-32 w-32 rotate-[18deg]', ornamentEcho: 'right-6 -top-10 h-20 w-20 -rotate-[48deg]' },
  { ornament: '-right-6 -bottom-8 h-32 w-32 -rotate-[62deg]', ornamentEcho: '-right-14 bottom-6 h-24 w-24 rotate-[96deg]' },
  {
    ornament: '-right-10 top-1/2 -translate-y-1/2 h-32 w-32 rotate-[128deg]',
    ornamentEcho: 'right-2 -bottom-12 h-24 w-24 -rotate-[20deg]',
  },
  { ornament: '-right-4 -top-6 h-32 w-32 rotate-[72deg]', ornamentEcho: '-right-6 bottom-1 h-20 w-20 -rotate-[12deg]' },
]

function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const { ornament, ornamentEcho } = ORNAMENTS[index % ORNAMENTS.length]

  return (
    <article
      className="relative flex flex-col gap-3 overflow-hidden rounded-xl px-5 py-4 backdrop-blur-xl"
      style={{
        backgroundImage:
          'linear-gradient(160deg, rgba(220,225,229,0.14), rgba(220,225,229,0.04)), linear-gradient(160deg, #0e353d 0%, #08191d 100%)',
        border: '1px solid rgba(220,225,229,0.14)',
        boxShadow:
          '0 12px 30px -14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 22px -8px rgba(108,158,165,0.3)',
      }}
    >
      <img
        src={allerviaMark}
        alt=""
        aria-hidden="true"
        className={cn('pointer-events-none absolute object-contain', ornament)}
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.07 }}
      />
      <img
        src={allerviaMark}
        alt=""
        aria-hidden="true"
        className={cn('pointer-events-none absolute object-contain', ornamentEcho)}
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.05 }}
      />
      <p className="relative flex items-center gap-2 text-[0.88rem] font-medium" style={{ color: '#8FB4BA' }}>
        {metric.icon && (
          <FontAwesomeIcon
            icon={metric.icon}
            style={{ fontSize: 13, color: '#B9D8DC', filter: 'drop-shadow(0 0 3px rgba(143,180,186,0.7))' }}
          />
        )}
        {metric.label}
      </p>
      <StatValue
        value={metric.value}
        unit={metric.unit}
        className="relative text-[2.2rem]"
        color="#F2F6F7"
        mutedColor="#8FB4BA"
      />
    </article>
  )
}

export function MetricsSection({ metrics, children }: MetricsSectionProps) {
  return (
    <section className="relative z-30 mt-4 shrink-0 pb-10">
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} index={index} />
        ))}
      </div>

      {children && <div className="mt-4 grid grid-cols-3 gap-4">{children}</div>}
    </section>
  )
}
