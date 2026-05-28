import { Pin, PinOff } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

interface ChartCardProps {
  id: string
  title: string
  archived: boolean
  onToggleArchive: (id: string) => void
  filterSlot?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

export function ChartCard({
  id,
  title,
  archived,
  onToggleArchive,
  filterSlot,
  fullWidth,
  children,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'border border-(--border-custom) rounded-xl p-4 group',
        fullWidth ? 'basis-full w-full' : 'flex-1 basis-[calc(50%-0.5rem)] min-w-95',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-(--text)">{title}</h3>
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
