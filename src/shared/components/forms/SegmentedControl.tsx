import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

export type SegmentedControlSize = 'xs' | 'sm' | 'md'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (next: T) => void
  options: SegmentedControlOption<T>[]
  size?: SegmentedControlSize
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
}

const SIZE_CLASS: Record<SegmentedControlSize, string> = {
  xs: 'h-6 text-[0.55rem]',
  sm: 'h-7 text-[0.65rem]',
  md: 'h-8 text-xs',
}

const ITEM_PADDING: Record<SegmentedControlSize, string> = {
  xs: 'px-2',
  sm: 'px-2.5',
  md: 'px-3',
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  fullWidth,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'flex items-stretch gap-0.5 rounded-lg border border-[#CBD6D6] bg-[#F3F5F6] p-1',
        SIZE_CLASS[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              ITEM_PADDING[size],
              fullWidth && 'flex-1',
              active
                ? 'bg-brand/80 text-white shadow-sm font-semibold'
                : 'text-(--text-muted) hover:text-(--text)'
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
