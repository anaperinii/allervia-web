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
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
}

// Same resting white circle as the toolbar's CircleButton; the tone only shows
// up on hover so rows of icon buttons stay quiet.
const TONE_CLASS: Record<IconButtonTone, string> = {
  brand: 'border border-[#DDE6E6] bg-white text-[#4A6469] hover:text-[#12333a] hover:border-[#12333a]/35',
  danger: 'border border-[#DDE6E6] bg-white text-[#4A6469] hover:text-[#A41517] hover:border-[#A41517]/45',
  warning: 'border border-[#DDE6E6] bg-white text-[#4A6469] hover:text-[#8a5c08] hover:border-[#B4780A]/45',
  success: 'border border-[#DDE6E6] bg-white text-[#4A6469] hover:text-[#1d6772] hover:border-[#257E8C]/45',
  neutral: 'border border-[#DDE6E6] bg-white text-[#4A6469] hover:text-[#12333a] hover:border-[#4A6469]/35',
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
    'flex items-center justify-center rounded-full shrink-0 transition-all duration-200 cursor-pointer hover:scale-105',
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
