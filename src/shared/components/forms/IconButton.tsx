import { cn } from '@/shared/lib/cn'
import { Link } from '@tanstack/react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { ButtonTone } from './Button'

export type IconButtonTone = ButtonTone
export type IconButtonSize = 'sm' | 'md' | 'lg'

export type IconButtonLegacyVariant = 'default' | 'brand' | 'danger'

type SharedProps = {
  tone?: IconButtonTone
  variant?: IconButtonLegacyVariant
  size?: IconButtonSize
  className?: string
  children: ReactNode
  disabled?: boolean
  'aria-label': string
}

type IconButtonAsAction = SharedProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'variant' | 'className' | 'children' | 'disabled' | 'aria-label'> & {
  to?: never
}

type IconButtonAsLink = SharedProps & {
  to: string
  params?: Record<string, unknown>
  search?: Record<string, unknown>
  onClick?: never
}

type IconButtonProps = IconButtonAsAction | IconButtonAsLink

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
}

const TONE_CLASS: Record<IconButtonTone, string> = {
  brand: 'text-(--text-muted) hover:bg-teal-50 hover:text-brand',
  danger: 'text-(--text-muted) hover:bg-[#A41517]/10 hover:text-[#A41517]',
  warning: 'text-(--text-muted) hover:bg-yellow-50 hover:text-yellow-700',
  success: 'text-(--text-muted) hover:bg-emerald-50 hover:text-emerald-700',
  neutral: 'text-(--text-muted) hover:bg-gray-50 hover:text-(--text)',
}

function resolveTone(legacy: IconButtonLegacyVariant | undefined, explicit: IconButtonTone | undefined): IconButtonTone {
  if (explicit) return explicit
  if (legacy === 'default') return 'neutral'
  if (legacy === 'brand') return 'brand'
  if (legacy === 'danger') return 'danger'
  return 'neutral'
}

export function IconButton(props: IconButtonProps) {
  const { tone, variant, size = 'md', className, children, disabled, 'aria-label': ariaLabel } = props
  const resolved = resolveTone(variant, tone)
  const cls = cn(
    'flex items-center justify-center rounded-lg transition-all cursor-pointer',
    SIZE_CLASS[size],
    TONE_CLASS[resolved],
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  )

  if ('to' in props && props.to !== undefined) {
    return (

      <Link to={props.to as any} params={props.params as any} search={props.search as any} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }

  const asAction = props as IconButtonAsAction
  const { tone: _t, variant: _v, size: _s, className: _c, children: _ch, disabled: _d, 'aria-label': _a, ...rest } = asAction
  void _t; void _v; void _s; void _c; void _ch; void _d; void _a
  return (
    <button {...rest} aria-label={ariaLabel} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}
