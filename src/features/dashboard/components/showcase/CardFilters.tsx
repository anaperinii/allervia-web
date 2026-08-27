import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import { CircleButton, SelectPill, SHOWCASE } from '@/shared/components/showcase'
import type { CardFilter } from '@/features/dashboard/hooks/useChartWindow'
import { WeekPicker } from './WeekPickerPopover'

const PANEL_WIDTH = 208

const FILTER_LABELS: Record<string, string> = {
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
  range: 'Intervalo',
}

export function CardFilters({ filters, active = false }: { filters: CardFilter[]; active?: boolean }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLSpanElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open) return

    const place = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return
      setCoords({
        top: rect.bottom + 8,
        left: Math.max(12, Math.min(rect.right - PANEL_WIDTH, window.innerWidth - PANEL_WIDTH - 12)),
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
      if (target.closest('[role="dialog"]')) return
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
    <span ref={anchorRef} className="inline-flex">
      <CircleButton
        icon={faSliders}
        size={32}
        iconSize={10}
        active={open || active}
        aria-label="Filtros"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      />

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Filtros do card"
            className="fixed z-[55] flex flex-col gap-2 rounded-2xl p-3 shadow-[0_18px_48px_-20px_rgba(16,60,68,0.45)] backdrop-blur-md"
            style={{
              top: coords.top,
              left: coords.left,
              width: PANEL_WIDTH,
              background: 'rgba(255,255,255,0.82)',
              border: '1px solid rgba(255,255,255,0.9)',
            }}
          >
            {filters.map((filter) => (
              <label key={filter.key} className="flex flex-col gap-1">
                <span className="text-[0.62rem] font-semibold uppercase tracking-wide" style={{ color: SHOWCASE.muted }}>
                  {FILTER_LABELS[filter.key] ?? filter.ariaLabel}
                </span>
                {filter.kind === 'week' ? (
                  <WeekPicker value={filter.value} onChange={filter.onChange} ariaLabel={filter.ariaLabel} />
                ) : (
                  <SelectPill
                    compact
                    value={filter.value}
                    onChange={filter.onChange}
                    options={filter.options ?? []}
                    aria-label={filter.ariaLabel}
                  />
                )}
              </label>
            ))}
          </div>,
          document.body,
        )}
    </span>
  )
}
