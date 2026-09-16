import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'

interface AllerviaWordmarkProps {
  className?: string
  style?: CSSProperties
}

/** Allervia wordmark set in Manrope, all lowercase, with a superscript "TM". */
export function AllerviaWordmark({ className, style }: AllerviaWordmarkProps) {
  return (
    <span className={cn('font-semibold lowercase leading-none whitespace-nowrap tracking-[-0.005em]', className)} style={style}>
      allervia
      <sup
        className="uppercase font-medium"
        style={{ fontSize: '0.3em', marginLeft: '0.12em', verticalAlign: 'super', letterSpacing: '0.04em' }}
      >
        tm
      </sup>
    </span>
  )
}
