import { Pin, PinOff } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

interface ChartCardProps {
  id: string
  title: string
  archived: boolean
  onToggleArchive: (id: string) => void
  filterSlot?: ReactNode
  fullWidth?: boolean
  widthBasis?: string
  gradient?: string
  children: ReactNode
}

const CHART_CARD_SHADOW = [
  '0 10px 28px rgba(15,23,42,0.07)',
  '0 2px 6px rgba(15,23,42,0.04)',
  'inset 0 1.5px 0 rgba(255,255,255,0.95)',
  'inset 0 -1.5px 3px rgba(15,23,42,0.03)',
  'inset 0 0 0 1px rgba(226,232,240,0.7)',
].join(', ')

export function ChartCard({
  id,
  title,
  archived,
  onToggleArchive,
  filterSlot,
  fullWidth,
  widthBasis,
  gradient,
  children,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-gray-50/70 backdrop-blur-xl p-4',
        fullWidth ? 'basis-full w-full' : 'flex-1 min-w-72',
      )}
      style={{
        boxShadow: CHART_CARD_SHADOW,
        flexBasis: !fullWidth ? widthBasis ?? 'calc(50% - 0.5rem)' : undefined,
        backgroundImage: gradient,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-(--text)">{title}</h3>
        <div className="flex items-center gap-1">
          {filterSlot}
          <button
            onClick={() => onToggleArchive(id)}
            aria-label={archived ? 'Desarquivar gráfico' : 'Arquivar gráfico'}
            title={archived ? 'Desarquivar (Fixar)' : 'Arquivar (Ocultar)'}
            className="opacity-0 group-hover:opacity-100 p-1 text-(--text-muted) hover:bg-teal-50 hover:text-teal-600 rounded transition-all cursor-pointer"
          >
            {archived ? <Pin size={12} /> : <PinOff size={12} />}
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}
