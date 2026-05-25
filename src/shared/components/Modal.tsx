import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useEffect, useId, useRef, type ReactNode } from 'react'

type Size = 'sm' | 'md' | 'lg'
const SIZE_CLASS: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

type Tone = 'brand' | 'danger' | 'warning' | 'success' | 'neutral'
const ICON_TONE: Record<Tone, { bg: string; fg: string }> = {
  brand:   { bg: 'bg-brand-50',   fg: 'text-brand' },
  danger:  { bg: 'bg-red-50',     fg: 'text-red-500' },
  warning: { bg: 'bg-amber-50',   fg: 'text-amber-500' },
  success: { bg: 'bg-emerald-50', fg: 'text-emerald-500' },
  neutral: { bg: 'bg-gray-100',   fg: 'text-(--text-muted)' },
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: Size
  children: ReactNode
  footer?: ReactNode
  icon?: ReactNode
  tone?: Tone
  headerSlot?: ReactNode
  ariaLabel?: string
}

export function Modal({ open, onClose, title, size = 'md', children, footer, icon, tone = 'brand', headerSlot, ariaLabel }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = (document.activeElement as HTMLElement | null) ?? null
    const dialog = dialogRef.current
    if (!dialog) return

    const focusables = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    focusables()[0]?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previouslyFocused.current?.focus?.()
    }
  }, [open])

  if (!open) return null
  const hasHeader = title || headerSlot || icon
  const toneClasses = ICON_TONE[tone]
  const labelProps = title
    ? { 'aria-labelledby': titleId }
    : { 'aria-label': ariaLabel ?? 'Diálogo' }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        {...labelProps}
        className={cn(
          'bg-white rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200',
          SIZE_CLASS[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {hasHeader && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom) shrink-0">
            {headerSlot ?? (
              icon ? (
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', toneClasses.bg)}>
                    <span className={cn('flex items-center justify-center', toneClasses.fg)}>{icon}</span>
                  </div>
                  <h3 id={titleId} className="text-sm font-bold text-(--text)">{title}</h3>
                </div>
              ) : (
                <h3 id={titleId} className="text-sm font-bold text-(--text)">{title}</h3>
              )
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="px-5 py-4 space-y-3.5 flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
