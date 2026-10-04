import type { ReactNode } from 'react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SHOWCASE, StatValue } from '@/shared/components/showcase'
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
      className={fullWidth ? 'col-span-3 rounded-xl p-5' : 'rounded-xl p-5'}
      style={{ background: SHOWCASE.white, border: `1px solid ${SHOWCASE.line}` }}
    >
      <header className="mb-0 flex items-start justify-between gap-3">
        <h3 className="text-[0.92rem] font-medium" style={{ color: SHOWCASE.ink }}>
          {title}
        </h3>
        {filters && <CardFilters filters={filters} active={filtersActive} inline={fullWidth} />}
      </header>
      {children}
    </section>
  )
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article
      className="flex flex-col gap-5 rounded-xl p-5"
      style={{ background: SHOWCASE.white, border: `1px solid ${SHOWCASE.line}` }}
    >
      <p className="flex items-center gap-2 text-[0.82rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
        {metric.icon && (
          <FontAwesomeIcon icon={metric.icon} style={{ fontSize: 13, color: SHOWCASE.muted }} />
        )}
        {metric.label}
      </p>
      <StatValue value={metric.value} unit={metric.unit} className="text-[2.2rem]" />
    </article>
  )
}

export function MetricsSection({ metrics, children }: MetricsSectionProps) {
  return (
    <section className="relative z-30 mt-4 shrink-0 pb-10">
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {children && <div className="mt-4 grid grid-cols-3 gap-4">{children}</div>}
    </section>
  )
}
