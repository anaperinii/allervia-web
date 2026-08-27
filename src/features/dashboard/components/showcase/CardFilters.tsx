import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import { CircleButton, SelectPill, SHOWCASE } from '@/shared/components/showcase'
import type { CardFilter } from '@/features/dashboard/hooks/useChartWindow'
import { WeekPicker } from './WeekPickerPopover'
import { cn } from '@/shared/lib/cn'

const PANEL_WIDTH = 208

const FILTER_LABELS: Record<string, string> = {
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
  range: 'Intervalo',
  top: 'Exibir',
  order: 'Ordem',
}

export function CardFilters({
  filters,
  active = false,
  dark = false,
  inline = false,
}: {
  filters: CardFilter[]
  active?: boolean
  dark?: boolean
  inline?: boolean
}) {
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

  if (inline) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-full transition-all duration-500 ease-out',
          open ? 'py-0.5 pl-2 pr-0.5' : 'p-0',
        )}
        style={{
          background: open ? (dark ? 'rgba(220,225,229,0.06)' : 'rgba(255,255,255,0.45)') : 'transparent',
          border: open
            ? `1px solid ${dark ? 'rgba(220,225,229,0.14)' : 'rgba(255,255,255,0.65)'}`
            : '1px solid transparent',
        }}
      >
        <div
          className={cn(
            'flex items-center gap-1.5 overflow-hidden transition-all duration-500 ease-out',
            open ? 'max-w-3xl translate-x-0 opacity-100' : 'max-w-0 translate-x-6 opacity-0',
          )}
        >
          {filters.map((filter) =>
            filter.kind === 'week' ? (
              <WeekPicker key={filter.key} value={filter.value} onChange={filter.onChange} ariaLabel={filter.ariaLabel} />
            ) : (
              <SelectPill
                key={filter.key}
                compact
                dark={dark}
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options ?? []}
                aria-label={filter.ariaLabel}
              />
            ),
          )}
        </div>

        <CircleButton
          icon={faSliders}
          size={32}
          iconSize={10}
          active={open || active}
          idleBackground={dark ? 'rgba(220,225,229,0.08)' : undefined}
          idleColor={dark ? '#DCE1E5' : undefined}
          idleBorderColor={dark ? 'rgba(220,225,229,0.16)' : undefined}
          aria-label="Filtros"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        />
      </div>
    )
  }

  return (
    <span ref={anchorRef} className="inline-flex">
      <CircleButton
        icon={faSliders}
        size={32}
        iconSize={10}
        active={open || active}
        idleBackground={dark ? 'rgba(220,225,229,0.08)' : undefined}
        idleColor={dark ? '#DCE1E5' : undefined}
        idleBorderColor={dark ? 'rgba(220,225,229,0.16)' : undefined}
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
              background: dark ? 'rgba(10,32,37,0.92)' : 'rgba(255,255,255,0.82)',
              border: dark ? '1px solid rgba(220,225,229,0.16)' : '1px solid rgba(255,255,255,0.9)',
            }}
          >
            {filters.map((filter) => (
              <label key={filter.key} className="flex flex-col gap-1">
                <span
                  className="text-[0.62rem] font-semibold uppercase tracking-wide"
                  style={{ color: dark ? '#7FA6AC' : SHOWCASE.muted }}
                >
                  {FILTER_LABELS[filter.key] ?? filter.ariaLabel}
                </span>
                {filter.kind === 'week' ? (
                  <WeekPicker value={filter.value} onChange={filter.onChange} ariaLabel={filter.ariaLabel} />
                ) : (
                  <SelectPill
                    compact
                    dark={dark}
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
