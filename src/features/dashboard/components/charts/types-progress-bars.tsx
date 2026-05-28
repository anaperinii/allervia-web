import { SEQUENTIAL_TYPE_COLORS } from '@/features/dashboard/constants/chart-colors'

interface TypeDatum {
  name: string
  value: number
  pct: number
}

interface TypesProgressBarsProps {
  data: TypeDatum[]
  showCountsAlways?: boolean
}

export function TypesProgressBars({ data, showCountsAlways = false }: TypesProgressBarsProps) {
  const ariaLabel = `Distribuição por tipo de imunoterapia: ${data.map((d) => `${d.name} ${d.pct}% (${d.value} paciente${d.value !== 1 ? 's' : ''})`).join(', ')}.`

  return (
    <div className="space-y-3 mt-1" role="img" aria-label={ariaLabel}>
      {data.map((datum, index) => {
        const color = SEQUENTIAL_TYPE_COLORS[index % SEQUENTIAL_TYPE_COLORS.length]
        return (
          <div key={datum.name} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-(--text)">{datum.name}</span>
              <div className="flex items-center gap-2">
                <span
                  className={
                    showCountsAlways
                      ? 'text-[0.6rem] text-(--text-muted)'
                      : 'text-[0.6rem] text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity'
                  }
                >
                  {datum.value} pacientes
                </span>
                <span className="text-xs font-bold" style={{ color }}>{datum.pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${datum.pct}%`, backgroundColor: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
