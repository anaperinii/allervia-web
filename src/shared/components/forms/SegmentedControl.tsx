import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

export type SegmentedControlSize = 'xs' | 'sm' | 'md'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: ReactNode
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
  xs: 'h-7 text-[0.6rem]',
  sm: 'h-8 text-[0.7rem]',
  md: 'h-9 text-[0.78rem]',
}

const ITEM_PADDING: Record<SegmentedControlSize, string> = {
  xs: 'px-2.5',
  sm: 'px-3',
  md: 'px-4',
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
        // inline-flex so the track hugs its options instead of filling a block parent
        'inline-flex w-max items-stretch gap-0.5 rounded-full border border-[#DDE6E6] bg-white p-0.5',
        SIZE_CLASS[size],
        fullWidth && 'flex w-full',
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
              'rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap',
              ITEM_PADDING[size],
              fullWidth && 'flex-1',
              active ? 'bg-[#12333a] text-white' : 'text-[#4A6469] hover:text-[#12333a]'
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
