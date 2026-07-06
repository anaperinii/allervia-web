import { cn } from '@/shared/lib/cn'
import { Link } from '@tanstack/react-router'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonTone = 'brand' | 'danger' | 'warning' | 'success' | 'neutral'
export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonLegacyVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'success'

type SharedProps = {
  tone?: ButtonTone
  variant?: ButtonVariant | ButtonLegacyVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  prominent?: boolean
  className?: string
  children?: ReactNode
  disabled?: boolean
}

type ButtonAsAction = SharedProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'variant' | 'className' | 'children' | 'disabled'> & {
  to?: never
}

type ButtonAsLink = SharedProps & {
  to: string
  params?: Record<string, unknown>
  search?: Record<string, unknown>
  onClick?: never
}

type ButtonProps = ButtonAsAction | ButtonAsLink

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-[0.65rem]',
  md: 'h-8 px-4 text-xs',
  lg: 'h-10 px-5 text-sm',
}

const PROMINENT_SHADOW: Record<ButtonTone, string> = {
  brand: 'shadow-[0_2px_12px_rgba(108,158,165,0.3)]',
  danger: 'shadow-[0_2px_12px_rgba(220,38,38,0.3)]',
  warning: 'shadow-[0_2px_12px_rgba(234,179,8,0.3)]',
  success: 'shadow-[0_2px_12px_rgba(52,211,153,0.3)]',
  neutral: 'shadow-[0_2px_12px_rgba(0,0,0,0.1)]',
}

const STYLES: Record<ButtonTone, Record<ButtonVariant, string>> = {
  brand: {
    solid: 'bg-linear-to-br from-brand to-brand-dark text-white before:content-[""] before:absolute before:inset-0 before:bg-linear-to-br before:from-brand-dark before:to-brand-dark before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none',
    outline: 'border-[1.5px] border-brand text-brand hover:bg-brand/15 hover:border-brand-dark hover:text-brand-dark',
    ghost: 'text-brand hover:bg-brand/15',
  },
  danger: {
    solid: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-[1.5px] border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400',
    ghost: 'text-red-600 hover:bg-red-50',
  },
  warning: {
    solid: 'bg-linear-to-br from-yellow-500 to-amber-500 text-white before:content-[""] before:absolute before:inset-0 before:bg-linear-to-br before:from-yellow-600 before:to-amber-600 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none',
    outline: 'border-[1.5px] border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400',
    ghost: 'text-yellow-700 hover:bg-yellow-50',
  },
  success: {
    solid: 'bg-linear-to-br from-emerald-400 to-emerald-500 text-white before:content-[""] before:absolute before:inset-0 before:bg-linear-to-br before:from-emerald-500 before:to-emerald-600 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none',
    outline: 'border-[1.5px] border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400',
    ghost: 'text-emerald-700 hover:bg-emerald-50',
  },
  neutral: {
    solid: 'bg-gray-700 text-white hover:bg-gray-800',
    outline: 'border-[1.5px] border-(--border-custom) text-(--text-muted) hover:bg-gray-50',
    ghost: 'text-(--text-muted) hover:bg-gray-50',
  },
}

function resolveLegacy(
  legacyOrNew: ButtonProps['variant'],
  explicitTone: ButtonTone | undefined,
): { tone: ButtonTone; variant: ButtonVariant } {
  switch (legacyOrNew) {
    case 'primary':
      return { tone: explicitTone ?? 'brand', variant: 'solid' }
    case 'danger':
      return { tone: 'danger', variant: 'solid' }
    case 'warning':
      return { tone: 'warning', variant: 'solid' }
    case 'success':
      return { tone: 'success', variant: 'solid' }
    case 'outline':
      return { tone: explicitTone ?? 'neutral', variant: 'outline' }
    case 'ghost':
      return { tone: explicitTone ?? 'neutral', variant: 'ghost' }
    case 'solid':
    case undefined:
      return { tone: explicitTone ?? 'brand', variant: 'solid' }
    default:
      return { tone: explicitTone ?? 'brand', variant: legacyOrNew }
  }
}

export function Button(props: ButtonProps) {
  const {
    tone,
    variant,
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth,
    prominent,
    className,
    children,
    disabled,
  } = props
  const resolved = resolveLegacy(variant, tone)
  const cls = cn(
    'relative isolate overflow-hidden rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all cursor-pointer whitespace-nowrap',
    SIZE_CLASS[size],
    STYLES[resolved.tone][resolved.variant],
    prominent && resolved.variant === 'solid' && PROMINENT_SHADOW[resolved.tone],
    fullWidth && 'w-full',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  )

  if ('to' in props && props.to !== undefined) {
    return (

      <Link to={props.to as any} params={props.params as any} search={props.search as any} className={cls}>
        {leftIcon && <span className="relative z-10 inline-flex">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {rightIcon && <span className="relative z-10 inline-flex">{rightIcon}</span>}
      </Link>
    )
  }

  const asAction = props as ButtonAsAction
  const { tone: _t, variant: _v, size: _s, leftIcon: _l, rightIcon: _r, fullWidth: _fw, prominent: _p, className: _c, children: _ch, disabled: _d, ...rest } = asAction
  void _t; void _v; void _s; void _l; void _r; void _fw; void _p; void _c; void _ch; void _d
  return (
    <button {...rest} disabled={disabled} className={cls}>
      {leftIcon && <span className="relative z-10 inline-flex">{leftIcon}</span>}
      <span className="relative z-10">{children}</span>
      {rightIcon && <span className="relative z-10 inline-flex">{rightIcon}</span>}
    </button>
  )
}
