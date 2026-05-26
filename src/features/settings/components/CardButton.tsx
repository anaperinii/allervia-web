import { cn } from '@/shared/lib/cn'
import { Link } from '@tanstack/react-router'
import { ChevronRight, ExternalLink } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Orientation = 'horizontal' | 'vertical'

type SharedProps = {
  icon: ReactNode
  title: ReactNode
  description?: ReactNode
  trailing?: ReactNode
  orientation?: Orientation
  iconColor?: string
  className?: string
}

type CardButtonAsAction = SharedProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
  to?: never
}

type CardButtonAsLink = SharedProps & {
  to: string
  params?: Record<string, unknown>
  search?: Record<string, unknown>
  onClick?: never
}

type CardButtonProps = CardButtonAsAction | CardButtonAsLink

const WRAPPER_HORIZONTAL =
  'flex w-full items-center gap-3.5 rounded-lg border border-(--border-custom) bg-white p-3 text-left transition-all hover:border-teal-300 hover:shadow-[0_2px_8px_rgba(20,184,166,0.08)] group cursor-pointer'

const WRAPPER_VERTICAL =
  'block w-full rounded-xl border border-(--border-custom) bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm group cursor-pointer'

function HorizontalInner({ icon, title, description, trailing }: SharedProps) {
  return (
    <>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-teal-50 transition-colors shrink-0">
        <span className="flex items-center justify-center text-(--text-muted) group-hover:text-teal-600 transition-colors">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-(--text)">{title}</div>
        {description && <div className="text-[0.65rem] text-(--text-muted)">{description}</div>}
      </div>
      {trailing ?? (
        <ChevronRight size={14} className="text-(--text-muted)/30 group-hover:text-teal-500 transition-colors shrink-0" />
      )}
    </>
  )
}

function VerticalInner({ icon, iconColor, title, description, trailing }: SharedProps) {
  const pillStyle = iconColor ? { backgroundColor: iconColor + '15' } : undefined
  const iconStyle = iconColor ? { color: iconColor } : undefined
  return (
    <>
      <div
        className={cn('flex h-9 w-9 items-center justify-center rounded-lg mb-2.5', !iconColor && 'bg-gray-50')}
        style={pillStyle}
      >
        <span className={cn('flex items-center justify-center', !iconColor && 'text-(--text-muted)')} style={iconStyle}>
          {icon}
        </span>
      </div>
      <div className="text-xs font-semibold text-(--text) flex items-center gap-1">
        {title}
        {trailing ?? (
          <ExternalLink size={10} className="text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      {description && <div className="text-[0.6rem] text-(--text-muted) mt-0.5">{description}</div>}
    </>
  )
}

export function CardButton(props: CardButtonProps) {
  const orientation = props.orientation ?? 'horizontal'
  const cls = cn(orientation === 'vertical' ? WRAPPER_VERTICAL : WRAPPER_HORIZONTAL, props.className)
  const Inner = orientation === 'vertical' ? VerticalInner : HorizontalInner
  const innerProps: SharedProps = {
    icon: props.icon,
    title: props.title,
    description: props.description,
    trailing: props.trailing,
    iconColor: props.iconColor,
  }
  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to as any} params={props.params as any} search={props.search as any} className={cls}>
        <Inner {...innerProps} />
      </Link>
    )
  }
  const asAction = props as CardButtonAsAction
  const { icon, title, description, trailing, orientation: _o, iconColor: _ic, className: _c, ...rest } = asAction
  void icon; void title; void description; void trailing; void _o; void _ic; void _c
  return (
    <button {...rest} className={cls}>
      <Inner {...innerProps} />
    </button>
  )
}
