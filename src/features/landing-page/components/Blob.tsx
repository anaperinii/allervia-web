import { cn } from '@/shared/lib/cn'

interface BlobProps {
  className: string
}

export function Blob({ className }: BlobProps) {
  return <div className={cn('pointer-events-none absolute rounded-full blur-3xl', className)} />
}
