import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

type MediaRowTone = 'brand' | 'neutral'
const TONE: Record<MediaRowTone, { bg: string; fg: string }> = {
  brand:   { bg: 'bg-brand-50', fg: 'text-brand' },
  neutral: { bg: 'bg-gray-100', fg: 'text-(--text-muted)' },
}

interface MediaRowProps {
  leading?: ReactNode
  icon?: ReactNode
  tone?: MediaRowTone
  title: ReactNode
  description?: ReactNode
  trailing?: ReactNode
  className?: string
}

export function MediaRow({ leading, icon, tone = 'brand', title, description, trailing, className }: MediaRowProps) {
  const t = TONE[tone]
  const leadingNode = leading ?? (icon && (
    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', t.bg)}>
      <span className={cn('flex items-center justify-center', t.fg)}>{icon}</span>
    </div>
  ))
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {leadingNode}
        <div className="min-w-0">
          <div className="text-xs font-semibold text-(--text)">{title}</div>
          {description && <div className="text-[0.65rem] text-(--text-muted)">{description}</div>}
        </div>
      </div>
      {trailing}
    </div>
  )
}
