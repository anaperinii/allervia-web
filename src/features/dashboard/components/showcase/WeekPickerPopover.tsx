import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import { format } from 'date-fns'
import { ptBR as ptBRDateFns } from 'date-fns/locale'
import proArt from '@/assets/pro-art.jpg'
import { SHOWCASE } from '@/shared/components/showcase'
import { weekKey, weekRangeFromKey } from '@/features/dashboard/hooks/useChartWindow'
import 'react-day-picker/style.css'

const POPOVER_WIDTH = 340

export function formatWeek(value: string) {
  const range = weekRangeFromKey(value)
  if (!range) return 'Semana'
  const from = format(range.from, 'dd/MM', { locale: ptBRDateFns })
  const to = format(range.to, 'dd/MM', { locale: ptBRDateFns })
  return `${from} – ${to}`
}

export function WeekPicker({
  value,
  onChange,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const range = weekRangeFromKey(value)

  useLayoutEffect(() => {
    if (!open) return

    const place = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return
      setCoords({
        top: rect.bottom + 8,
        left: Math.max(12, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 12)),
      })
    }

    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full py-0 pl-1 pr-3.5 text-[0.7rem] font-medium"
        style={{
          background: range ? SHOWCASE.ink : SHOWCASE.white,
          border: range ? '1px solid transparent' : `1px solid ${SHOWCASE.line}`,
          color: range ? SHOWCASE.onAccent : SHOWCASE.inkSoft,
        }}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{
            background: range ? 'rgba(255,255,255,0.16)' : SHOWCASE.cardInner,
            color: range ? SHOWCASE.onAccent : SHOWCASE.inkSoft,
          }}
        >
          <FontAwesomeIcon icon={faCalendar} style={{ fontSize: 10 }} />
        </span>
        {range ? formatWeek(value) : 'Semana'}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={ariaLabel}
            className="fixed z-[60] overflow-hidden rounded-3xl p-4 shadow-[0_18px_48px_-20px_rgba(16,60,68,0.45)]"
            style={{
              top: coords.top,
              left: coords.left,
              width: 'max-content',
              maxWidth: '92vw',
              border: '1px solid rgba(255,255,255,0.42)',
            }}
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
                onDayClick={(day) => {
                  onChange(weekKey(day))
                  setOpen(false)
                }}
                showOutsideDays
                className="allervia-day-picker"
              />

              <footer
                className="mt-3 flex items-center justify-between gap-4 border-t pt-3"
                style={{ borderColor: 'rgba(221,230,230,0.8)' }}
              >
                <span className="text-[0.72rem] font-medium" style={{ color: SHOWCASE.inkSoft }}>
                  {range ? formatWeek(value) : 'Selecione um dia da semana'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onChange('all')
                    setOpen(false)
                  }}
                  className="h-8 cursor-pointer rounded-full px-3.5 text-[0.7rem] font-medium"
                  style={{ border: `1px solid ${SHOWCASE.line}`, color: SHOWCASE.inkSoft }}
                >
                  Limpar
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
