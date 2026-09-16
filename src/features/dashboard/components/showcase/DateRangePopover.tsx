import { useEffect, useRef } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import { format } from 'date-fns'
import { ptBR as ptBRDateFns } from 'date-fns/locale'
import proArt from '@/assets/pro-art.jpg'
import { cn } from '@/shared/lib/cn'
import { SHOWCASE } from '@/shared/components/showcase'
import 'react-day-picker/style.css'

export const DATE_RANGE_ANCHOR_ATTR = 'data-daterange-anchor'

interface DateRangePopoverProps {
  open: boolean
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
  onClose: () => void
}

export function formatRange(range: DateRange | undefined) {
  if (!range?.from) return 'Selecionar período'
  const from = format(range.from, 'dd MMM yyyy', { locale: ptBRDateFns })
  if (!range.to) return from
  return `${from} – ${format(range.to, 'dd MMM yyyy', { locale: ptBRDateFns })}`
}

export function DateRangePopover({ open, range, onRangeChange, onClose }: DateRangePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (ref.current?.contains(target)) return
      if (target.closest(`[${DATE_RANGE_ANCHOR_ATTR}]`)) return
      onClose()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Selecionar período"
      aria-hidden={!open}
      className={cn(
        'absolute -left-1 top-full z-50 mt-2 origin-top-left overflow-hidden rounded-3xl p-4 transition-all duration-200 ease-out',
        'shadow-[0_18px_48px_-20px_rgba(16,60,68,0.45)]',
        open ? 'opacity-100 scale-100 translate-y-0' : 'pointer-events-none opacity-0 scale-95 -translate-y-1',
      )}
      style={{ border: '1px solid rgba(255,255,255,0.42)' }}
    >
      <img
        src={proArt}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 rounded-3xl object-cover blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: 'rgba(255,255,255,0.62)' }}
      />

      <div className="relative z-10">
      <DayPicker
        mode="range"
        numberOfMonths={1}
        locale={ptBR}
        selected={range}
        onSelect={onRangeChange}
        showOutsideDays
        className="allervia-day-picker"
      />

      <footer
        className="mt-3 flex items-center justify-between gap-4 border-t pt-3"
        style={{ borderColor: 'rgba(221,230,230,0.8)' }}
      >
        <span className="text-[0.72rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
          {formatRange(range)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onRangeChange(undefined)}
            className="h-8 rounded-full px-3.5 text-[0.7rem] font-medium cursor-pointer transition-colors"
            style={{ border: `1px solid ${SHOWCASE.line}`, color: SHOWCASE.inkSoft }}
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-full px-3.5 text-[0.7rem] font-medium cursor-pointer transition-colors"
            style={{ background: SHOWCASE.ink, color: SHOWCASE.onAccent }}
          >
            Aplicar
          </button>
        </div>
      </footer>
      </div>
    </div>
  )
}
