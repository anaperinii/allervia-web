import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

export type ToastVariant = 'success' | 'warning' | 'info' | 'danger'
export type ToastPosition = 'top-right' | 'top-center'

interface VariantStyle {
  border: string
  iconBg: string
  iconColor: string
  solidBg: string
  solidBorder: string
}

const VARIANT_CLASS: Record<ToastVariant, VariantStyle> = {
  success: {
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
    solidBg: 'bg-emerald-500/75',
    solidBorder: 'border-emerald-300/60',
  },
  warning: {
    border: 'border-yellow-200',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-700',
    solidBg: 'bg-yellow-500/75',
    solidBorder: 'border-yellow-300/60',
  },
  info: {
    border: 'border-teal-200',
    iconBg: 'bg-teal-100',
    iconColor: 'text-brand',
    solidBg: 'bg-teal-500/75',
    solidBorder: 'border-teal-300/60',
  },
  danger: {
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    solidBg: 'bg-red-600/75',
    solidBorder: 'border-red-300/60',
  },
}

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-right': 'top-6 right-6',
  'top-center': 'top-6 left-1/2 -translate-x-1/2',
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
        <div className={cn('flex items-start gap-3 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-95 border', v.border)}>
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-0.5', v.iconBg, v.iconColor)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-(--text)">{title}</p>
            {description && <p className="text-xs text-(--text-muted) mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
