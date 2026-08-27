import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/shared/lib/cn'
import { SHOWCASE } from './tokens'

interface CircleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconDefinition
  active?: boolean
  size?: number
  iconSize?: number
  iconRotateDeg?: number
  activeBackground?: string
  activeColor?: string
  activeShadow?: string
  idleBackground?: string
  idleColor?: string
  idleBorderColor?: string
}

export function CircleButton({
  icon,
  active = false,
  size = 36,
  iconSize = 12,
  iconRotateDeg,
  activeBackground,
  activeColor,
  activeShadow,
  idleBackground,
  idleColor,
  idleBorderColor,
  className,
  ...rest
}: CircleButtonProps) {
  return (
    <button
      type="button"
      className={cn('inline-flex items-center justify-center rounded-full shrink-0 cursor-pointer transition-all duration-200 hover:scale-105', className)}
      style={{
        width: size,
        height: size,
        background: active ? activeBackground ?? SHOWCASE.ink : idleBackground ?? SHOWCASE.white,
        color: active ? activeColor ?? SHOWCASE.white : idleColor ?? SHOWCASE.inkSoft,
        border: active ? '1px solid transparent' : `1px solid ${idleBorderColor ?? SHOWCASE.line}`,
        boxShadow: active ? activeShadow : undefined,
      }}
      {...rest}
    >
      <FontAwesomeIcon
        icon={icon}
        className="transition-transform duration-300"
        style={{ fontSize: iconSize, transform: iconRotateDeg ? `rotate(${iconRotateDeg}deg)` : undefined }}
      />
    </button>
  )
}

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconDefinition
  active?: boolean
  children: ReactNode
}

export function Pill({ icon, active = false, children, className, ...rest }: PillProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-full px-4 text-[0.78rem] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200',
        className,
      )}
      style={{
        background: active ? SHOWCASE.ink : SHOWCASE.white,
        color: active ? SHOWCASE.white : SHOWCASE.inkSoft,
        border: active ? '1px solid transparent' : `1px solid ${SHOWCASE.line}`,
      }}
      {...rest}
    >
      {icon && <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />}
      {children}
    </button>
  )
}

interface SelectPillProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  compact?: boolean
  dark?: boolean
  'aria-label': string
}

export function SelectPill({ value, onChange, options, compact = false, dark = false, 'aria-label': ariaLabel }: SelectPillProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'rounded-full whitespace-nowrap shrink-0 cursor-pointer appearance-none outline-none font-medium',
        compact ? 'h-8 pl-3 pr-7 text-[0.7rem]' : 'h-9 px-4 pr-8 text-[0.78rem]',
      )}
      style={{
        background: `${dark ? 'rgba(220,225,229,0.08)' : SHOWCASE.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='${dark ? '%23DCE1E5' : '%234A6469'}' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 0.85rem center/0.6rem`,
        color: dark ? '#DCE1E5' : SHOWCASE.inkSoft,
        border: `1px solid ${dark ? 'rgba(220,225,229,0.16)' : SHOWCASE.line}`,
        colorScheme: dark ? 'dark' : undefined,
      }}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          style={dark ? { background: '#0e353d', color: '#DCE1E5' } : undefined}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function AccentBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-1 text-[0.62rem] font-bold tabular-nums', className)}
      style={{ background: SHOWCASE.accent, color: SHOWCASE.onAccent }}
    >
      {children}
    </span>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
  padded?: boolean
}

export function Card({ children, className, padded = true }: CardProps) {
  return (
    <section
      className={cn('relative flex h-full flex-col overflow-hidden rounded-3xl', padded && 'p-5', className)}
      style={{ background: SHOWCASE.card, border: `1px solid ${SHOWCASE.line}` }}
    >
      {children}
    </section>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function CardHeader({ title, subtitle, actions }: CardHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2 className="text-[1.05rem] font-semibold leading-tight" style={{ color: SHOWCASE.ink }}>
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[0.68rem] font-medium" style={{ color: SHOWCASE.muted }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </header>
  )
}

export function CardMetric({ caption, value, suffix, prefix }: { caption?: string; value: string; suffix?: string; prefix?: string }) {
  return (
    <div className="mb-3">
      {caption && (
        <div className="text-[0.68rem] font-medium mb-1" style={{ color: SHOWCASE.muted }}>
          {caption}
        </div>
      )}
      <div className="flex items-baseline" style={{ color: SHOWCASE.ink }}>
        {prefix && <span className="text-lg font-medium">{prefix}</span>}
        <span className="text-[2.35rem] font-semibold leading-none tracking-tight tabular-nums">{value}</span>
        {suffix && <span className="text-base font-medium ml-0.5">{suffix}</span>}
      </div>
    </div>
  )
}

export function DayAxis({ days }: { days: string[] }) {
  return (
    <div className="flex items-center justify-between mt-2.5 text-[0.66rem] font-medium" style={{ color: SHOWCASE.muted }}>
      {days.map((day, i) => (
        <span key={`${day}-${i}`} className="flex-1 text-center">
          {day}
        </span>
      ))}
    </div>
  )
}
