import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { ReactNode } from 'react'

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
  progressBg: string
}

const VARIANT_CLASS: Record<ToastVariant, VariantStyle> = {
  success: {
    bg: 'bg-white/80',
    border: 'border-teal-200/40',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    titleColor: 'text-teal-900',
    descColor: 'text-slate-700',
    solidBg: 'bg-teal-500/80',
    solidBorder: 'border-teal-300/60',
    progressBg: 'bg-teal-500',
  },
  warning: {
    bg: 'bg-white/80',
    border: 'border-yellow-200/40',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    descColor: 'text-slate-700',
    solidBg: 'bg-yellow-500/80',
    solidBorder: 'border-yellow-300/60',
    progressBg: 'bg-yellow-500',
  },
  info: {
    bg: 'bg-white/80',
    border: 'border-teal-200/40',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    titleColor: 'text-teal-900',
    descColor: 'text-slate-700',
    solidBg: 'bg-teal-500/80',
    solidBorder: 'border-teal-300/60',
    progressBg: 'bg-teal-500',
  },
  danger: {
    bg: 'bg-white/80',
    border: 'border-red-200/40',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    descColor: 'text-slate-700',
    solidBg: 'bg-red-600/80',
    solidBorder: 'border-red-300/60',
    progressBg: 'bg-red-500',
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
  const [progress, setProgress] = useState(100)
  const [isClosing, setIsClosing] = useState(false)
  
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onCloseRef.current()
      setIsClosing(false)
    }, 300)
  }

  useEffect(() => {
    if (!open || autoDismissMs <= 0) return
    const timer = setTimeout(() => handleClose(), autoDismissMs)
    return () => clearTimeout(timer)
  }, [open, autoDismissMs])

  useEffect(() => {
    if (!open || autoDismissMs <= 0) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / autoDismissMs) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 50)

    return () => clearInterval(interval)
  }, [open, autoDismissMs])

  if (!open) return null
  const v = VARIANT_CLASS[variant]

  return (
    <>
      <div
        className={cn('fixed z-50', POSITION_CLASS[position])}
        style={{ animation: isClosing ? 'slide-down-fade 0.3s ease-in' : 'slide-up-fade 0.3s ease-out' }}
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
          <div className={cn('flex flex-col rounded-xl border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden w-96 border-white/20', v.bg)}>
            <div className="p-4 flex items-start gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-0.5', v.iconBg, v.iconColor)}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold', v.titleColor)}>{title}</p>
                {description && <div className={cn('text-xs mt-2', v.descColor)}>{description}</div>}
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar"
                className={cn('h-6 w-6 flex items-center justify-center rounded-md transition-all shrink-0 hover:bg-black/10', v.descColor)}
              >
                <X size={14} />
              </button>
            </div>
            {autoDismissMs > 0 && (
              <div className={cn('h-1 rounded-full', v.progressBg)} style={{ width: `${progress}%`, transition: 'width 50ms linear' }} />
            )}
          </div>
        )}
      </div>
    </>
  )
}
