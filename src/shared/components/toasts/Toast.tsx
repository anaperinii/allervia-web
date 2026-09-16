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

  return (
    <div
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
          className="flex items-start gap-3 rounded-xl backdrop-blur-xl p-4 w-95"
          style={{
            background: 'linear-gradient(180deg, #0e353d 0%, #08191d 100%)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <span
            className="flex items-center shrink-0 mt-0.5"
            style={{
              color: '#34d399',
              filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.7)) drop-shadow(0 0 3px rgba(16,185,129,0.5))',
            }}
          >
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#EDF2F3' }}>{title}</p>
            {description && <p className="text-xs mt-1" style={{ color: 'rgba(220,225,229,0.7)' }}>{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="h-6 w-6 flex items-center justify-center rounded-md transition-all shrink-0 hover:bg-white/10"
            style={{ color: 'rgba(220,225,229,0.6)' }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </button>
        </div>
      )}
    </div>
  )
}
