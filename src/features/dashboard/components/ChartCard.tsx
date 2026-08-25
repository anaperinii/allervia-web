import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

import { faThumbtack, faThumbtackSlash } from '@fortawesome/free-solid-svg-icons'
import { CircleButton, SHOWCASE } from '@/shared/components/showcase'

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
    <section
      className={cn(
        'group relative overflow-hidden rounded-3xl p-5',
        fullWidth ? 'basis-full w-full' : 'flex-1 min-w-72',
      )}
      style={{
        background: SHOWCASE.card,
        border: `1px solid ${SHOWCASE.line}`,
        flexBasis: !fullWidth ? widthBasis ?? 'calc(50% - 0.5rem)' : undefined,
        backgroundImage: gradient,
      }}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-[1.05rem] font-semibold leading-tight" style={{ color: SHOWCASE.ink }}>
          {title}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          {filterSlot}
          <CircleButton
            icon={archived ? faThumbtack : faThumbtackSlash}
            size={32}
            iconSize={10}
            onClick={() => onToggleArchive(id)}
            aria-label={archived ? 'Desarquivar gráfico' : 'Arquivar gráfico'}
            title={archived ? 'Desarquivar (Fixar)' : 'Arquivar (Ocultar)'}
            className="opacity-0 group-hover:opacity-100"
          />
        </div>
      </header>
      {children}
    </section>
  )
}
