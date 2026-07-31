import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/cn'
import type { ReactNode, AnchorHTMLAttributes, CSSProperties } from 'react'

type MarketingCTAVariant = 'filled' | 'outline'
type MarketingCTAShape = 'pill' | 'block'

interface SharedProps {
  variant: MarketingCTAVariant
  shape?: MarketingCTAShape
  children: ReactNode
  className?: string
}

interface AsLink extends SharedProps {
  to: string
  href?: never
  params?: Record<string, unknown>
  search?: Record<string, unknown>
}

interface AsAnchor extends SharedProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> {
  href: string
  to?: never
}

type MarketingCTAProps = AsLink | AsAnchor

const BASE = 'font-semibold cursor-pointer transition-all duration-250 no-underline'

const SHAPE: Record<MarketingCTAShape, string> = {
  pill: 'inline-block px-6 py-2.5 rounded-lg text-[0.9rem]',
  block: 'block w-full py-3 rounded-lg text-center text-sm',
}

const VARIANT_CLASS: Record<MarketingCTAVariant, string> = {
  filled: 'border-none text-white hover:brightness-95',
  outline:
    'border-[1.5px] bg-transparent hover:bg-[color:var(--ll-accent-bg-soft)] hover:shadow-[0_6px_16px_var(--ll-halo-accent)]',
}

const VARIANT_STYLE: Record<MarketingCTAVariant, CSSProperties> = {
  filled: {
    background: 'linear-gradient(to bottom right, var(--color-brand), var(--color-brand-dark))',
    color: '#ffffff',
    boxShadow: '0 2px 12px rgba(108,158,165,0.3)',
  },
  outline: {
    borderColor: 'var(--ll-accent-border)',
    color: 'var(--ll-accent-strong)',
  },
}

export function MarketingCTA(props: MarketingCTAProps) {
  const cls = cn(BASE, SHAPE[props.shape ?? 'pill'], VARIANT_CLASS[props.variant], props.className)
  const style = VARIANT_STYLE[props.variant]
  if ('to' in props && props.to !== undefined) {
    return (
      <Link
        to={props.to as any}
        params={props.params as any}
        search={props.search as any}
        className={cls}
        style={style}
      >
        {props.children}
      </Link>
    )
  }
  const { variant: _v, shape: _s, children, className: _c, ...rest } = props as AsAnchor
  void _v
  void _s
  void _c
  return (
    <a {...rest} className={cls} style={style}>
      {children}
    </a>
  )
}
