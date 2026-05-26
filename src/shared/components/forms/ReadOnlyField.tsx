import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

interface ReadOnlyFieldProps {
  children: ReactNode
  className?: string
}

export function ReadOnlyField({ children, className }: ReadOnlyFieldProps) {
  return (
    <div
      className={cn(
        'w-full h-9 rounded-lg border border-(--border-custom) bg-gray-100/80 px-3 text-xs text-(--text-muted) cursor-not-allowed flex items-center',
        className,
      )}
    >
      {children}
    </div>
  )
}
