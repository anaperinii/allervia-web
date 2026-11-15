import { cn } from '@/shared/lib/cn'

interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 22, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn('inline-block shrink-0 animate-spin rounded-full border-2 border-brand/25 border-t-brand', className)}
      style={{ width: size, height: size }}
    />
  )
}

export function CenteredSpinner({ size = 22, className }: SpinnerProps) {
  return (
    <div className={cn('flex flex-1 items-center justify-center py-10', className)}>
      <Spinner size={size} />
    </div>
  )
}
