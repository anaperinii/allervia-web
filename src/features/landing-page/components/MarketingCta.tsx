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
  pill: 'inline-block px-6 py-2.5 rounded-full text-[0.9rem]',
  block: 'block w-full py-3 rounded-xl text-center text-sm',
}

const VARIANT_CLASS: Record<MarketingCTAVariant, string> = {
  filled:
    'border-none text-[#06232a] hover:-translate-y-0.5',
  outline:
    'border-[1.5px] border-[rgba(108,158,165,0.55)] bg-transparent text-[#9BC1C4] hover:bg-[rgba(108,158,165,0.10)] hover:border-[rgba(108,158,165,0.85)]',
}

const VARIANT_STYLE: Record<MarketingCTAVariant, CSSProperties | undefined> = {
  filled: {
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.06) 100%), #9BC1C4',
    boxShadow:
      '0 4px 20px rgba(155,193,196,0.40), inset 0 1px 0 rgba(255,255,255,0.55)',
  },
  outline: undefined,
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
