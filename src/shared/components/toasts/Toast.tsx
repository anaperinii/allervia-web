import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export type ToastVariant = 'success' | 'warning' | 'info' | 'danger'
export type ToastPosition = 'top-right' | 'top-center'

interface VariantStyle {
  bg: string
  border: string
  iconBg: string
  iconColor: string
  titleColor: string
  descColor: string
  solidBg: string
  solidBorder: string
}

const VARIANT_CLASS: Record<ToastVariant, VariantStyle> = {
  success: {
    bg: 'bg-emerald-100/70',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-200',
    iconColor: 'text-emerald-700',
    titleColor: 'text-emerald-900',
    descColor: 'text-emerald-900/75',
    solidBg: 'bg-emerald-500/75',
    solidBorder: 'border-emerald-300/60',
  },
  warning: {
    bg: 'bg-yellow-100/70',
    border: 'border-yellow-300',
    iconBg: 'bg-yellow-200',
    iconColor: 'text-yellow-700',
    titleColor: 'text-yellow-900',
    descColor: 'text-yellow-900/75',
    solidBg: 'bg-yellow-500/75',
    solidBorder: 'border-yellow-300/60',
  },
  info: {
    bg: 'bg-teal-100/70',
    border: 'border-teal-300',
    iconBg: 'bg-teal-200',
    iconColor: 'text-teal-700',
    titleColor: 'text-teal-900',
    descColor: 'text-teal-900/75',
    solidBg: 'bg-teal-500/75',
    solidBorder: 'border-teal-300/60',
  },
  danger: {
    bg: 'bg-red-100/70',
    border: 'border-red-300',
    iconBg: 'bg-red-200',
    iconColor: 'text-red-700',
    titleColor: 'text-red-900',
    descColor: 'text-red-900/75',
    solidBg: 'bg-red-600/75',
    solidBorder: 'border-red-300/60',
  },
}

interface AccentStyle {
  icon: string
  glow: string
  border: string
}

const ACCENT: Record<ToastVariant, AccentStyle> = {
  success: {
    icon: '#059669',
    glow: 'rgba(16,185,129,0.45)',
    border: 'rgba(16,185,129,0.22)',
  },
  warning: {
    icon: '#d97706',
    glow: 'rgba(245,158,11,0.45)',
    border: 'rgba(245,158,11,0.26)',
  },
  info: {
    icon: '#0d9488',
    glow: 'rgba(20,184,166,0.45)',
    border: 'rgba(20,184,166,0.22)',
  },
  danger: {
    icon: '#dc2626',
    glow: 'rgba(239,68,68,0.45)',
    border: 'rgba(239,68,68,0.26)',
  },
}

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-right': 'top-3 right-4',
  'top-center': 'top-3 left-1/2 -translate-x-1/2',
}

const COMPACT_SHADOW =
  'shadow-[0_12px_32px_-8px_rgba(16,185,129,0.45),0_6px_16px_-4px_rgba(16,185,129,0.25),inset_0_1px_0_0_rgba(255,255,255,0.35)]'

interface ToastProps {
  open: boolean
  onClose: () => void
  variant?: ToastVariant
  icon: ReactNode
  title: string
  description?: ReactNode
  autoDismissMs?: number
  position?: ToastPosition
  compact?: boolean
}

export function Toast({
  open,
  onClose,
  variant = 'success',
  icon,
  title,
  description,
  autoDismissMs = 6000,
  position = 'top-right',
  compact = false,
}: ToastProps) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open || autoDismissMs <= 0) return
    const timer = setTimeout(() => onCloseRef.current(), autoDismissMs)
    return () => clearTimeout(timer)
  }, [open, autoDismissMs])

  if (!open) return null
  const v = VARIANT_CLASS[variant]
  const accent = ACCENT[variant]
  const urgent = variant === 'danger' || variant === 'warning'

  return (
    <div
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      className={cn('fixed z-50', POSITION_CLASS[position])}
      style={{ animation: 'slide-up-fade 0.3s ease-out' }}
    >
      {compact ? (
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border px-4 py-2 text-white backdrop-blur-md',
            v.solidBg,
            v.solidBorder,
            COMPACT_SHADOW,
          )}
        >
          <span className="flex items-center justify-center shrink-0">{icon}</span>
          <p className="text-xs font-semibold">{title}</p>
        </div>
      ) : (
        <div
          className="relative isolate flex items-start gap-3 overflow-hidden rounded-xl p-4 w-95"
          style={{
            background: '#ffffff',
            border: `1px solid ${accent.border}`,
            boxShadow:
              '0 12px 40px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.06)',
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-24 w-4/5 -translate-x-1/2 rounded-full"
            style={{ background: accent.glow, filter: 'blur(34px)' }}
          />
          <span
            className="flex items-center shrink-0 mt-0.5"
            style={{ color: accent.icon }}
          >
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{title}</p>
            {description && <p className="text-xs mt-1" style={{ color: '#475569' }}>{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="h-6 w-6 flex items-center justify-center rounded-md transition-all shrink-0 hover:bg-slate-900/5"
            style={{ color: '#94a3b8' }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </button>
        </div>
      )}
    </div>
  )
}
