import type { ReactNode } from 'react'
import { SHOWCASE } from '@/shared/components/showcase'

export function HoverBands({
  count,
  onHover,
  onSelect,
}: {
  count: number
  onHover: (index: number | null) => void
  onSelect?: (index: number) => void
}) {
  return (
    <div className="absolute inset-0 z-10 flex" onMouseLeave={() => onHover(null)}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={onSelect ? 'h-full flex-1 cursor-pointer' : 'h-full flex-1 cursor-default'}
          onMouseEnter={() => onHover(i)}
          onClick={onSelect ? () => onSelect(i) : undefined}
        />
      ))}
    </div>
  )
}

export function ChartTooltip({
  leftPct,
  topPct,
  label,
  children,
}: {
  leftPct: number
  topPct: number
  label: string
  children: ReactNode
}) {
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+0.55rem)] whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[0.66rem] leading-tight"
      style={{
        left: `${Math.min(Math.max(leftPct, 6), 94)}%`,
        top: `${topPct}%`,
        background: SHOWCASE.ink,
        color: '#eef3f4',
        boxShadow: '0 8px 20px rgba(16,60,68,0.22)',
      }}
    >
      <div className="font-medium opacity-70">{label}</div>
      <div className="mt-0.5 font-semibold tabular-nums">{children}</div>
    </div>
  )
}
