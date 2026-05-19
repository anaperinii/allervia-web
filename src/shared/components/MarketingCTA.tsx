import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/utils'
import type { ReactNode, AnchorHTMLAttributes } from 'react'

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

const VARIANT: Record<MarketingCTAVariant, string> = {
  filled:
    'border-none bg-linear-to-br from-brand to-teal-400 text-white shadow-[0_4px_20px_rgba(24,193,203,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(24,193,203,0.4)]',
  outline: 'border-[1.5px] border-brand bg-transparent text-brand hover:bg-brand-50',
}

export function MarketingCTA(props: MarketingCTAProps) {
  const cls = cn(BASE, SHAPE[props.shape ?? 'pill'], VARIANT[props.variant], props.className)
  if ('to' in props && props.to !== undefined) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link to={props.to as any} params={props.params as any} search={props.search as any} className={cls}>
        {props.children}
      </Link>
    )
  }
  const { variant: _v, shape: _s, children, className: _c, ...rest } = props as AsAnchor
  void _v
  void _s
  void _c
  return (
    <a {...rest} className={cls}>
      {children}
    </a>
  )
}
