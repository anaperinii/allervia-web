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
  sm: 'h-8 px-3.5 text-[0.7rem]',
  md: 'h-9 px-4 text-[0.78rem]',
  lg: 'h-11 px-5 text-[0.85rem]',
}

const PROMINENT_SHADOW: Record<ButtonTone, string> = {
  brand: 'shadow-[0_2px_10px_rgba(18,51,58,0.22)]',
  danger: 'shadow-[0_2px_10px_rgba(164,21,23,0.22)]',
  warning: 'shadow-[0_2px_10px_rgba(180,120,10,0.22)]',
  success: 'shadow-[0_2px_10px_rgba(37,126,140,0.22)]',
  neutral: 'shadow-[0_2px_10px_rgba(18,51,58,0.14)]',
}

const OUTLINE_BASE = 'border border-[#DDE6E6] bg-white'

const STYLES: Record<ButtonTone, Record<ButtonVariant, string>> = {
  brand: {
    solid: 'bg-[#12333a] text-white hover:bg-[#0c2429]',
    outline: 'border border-[#257E8C]/40 bg-[#257E8C]/6 text-[#1d6772] hover:border-[#257E8C]/70 hover:bg-[#257E8C]/12',
    ghost: 'text-[#12333a] hover:bg-[#12333a]/8',
  },
  danger: {
    solid: 'bg-[#A41517] text-white hover:bg-[#8a1114]',
    outline: 'border border-[#A41517]/40 bg-[#A41517]/6 text-[#A41517] hover:border-[#A41517]/70 hover:bg-[#A41517]/12',
    ghost: 'text-[#A41517] hover:bg-[#A41517]/10',
  },
  warning: {
    solid: 'bg-[#B4780A] text-white hover:bg-[#97640a]',
    outline: `${OUTLINE_BASE} text-[#8a5c08] hover:border-[#B4780A]/45`,
    ghost: 'text-[#8a5c08] hover:bg-[#B4780A]/10',
  },
  success: {
    solid: 'bg-[#257E8C] text-white hover:bg-[#1d6772]',
    outline: `${OUTLINE_BASE} text-[#1d6772] hover:border-[#257E8C]/45`,
    ghost: 'text-[#1d6772] hover:bg-[#257E8C]/10',
  },
  neutral: {
    solid: 'bg-[#4A6469] text-white hover:bg-[#3a5155]',
    outline: `${OUTLINE_BASE} text-[#4A6469] hover:border-[#4A6469]/35`,
    ghost: 'text-[#4A6469] hover:bg-[#4A6469]/10',
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
    'relative isolate rounded-full flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer whitespace-nowrap',
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
