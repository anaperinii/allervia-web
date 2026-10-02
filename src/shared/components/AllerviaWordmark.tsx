import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'

interface AllerviaWordmarkProps {
  className?: string
  style?: CSSProperties
}

export function AllerviaWordmark({ className, style }: AllerviaWordmarkProps) {
  return (
    <span className={cn('font-bold leading-none whitespace-nowrap tracking-[-0.005em]', className)} style={style}>
      Allervia
    </span>
  )
}
