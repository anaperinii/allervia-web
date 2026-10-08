import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { cn } from '@/shared/lib/cn'

interface TimeSelectProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  invalid?: boolean
  'aria-label'?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const ITEM_HEIGHT = 28
const VISIBLE_ITEMS = 5
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS

function splitTime(value: string): { hour: string; minute: string } {
  const [hour = '', minute = ''] = value.split(':')
  return { hour, minute }
}

/** Aceita "9", "930", "9:3", "09:30" e devolve o que já for um horário válido. */
function normalizeTyped(raw: string): string | null {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length < 3) return null
  const hour = Number(digits.slice(0, digits.length - 2))
  const minute = Number(digits.slice(-2))
  if (hour > 23 || minute > 59) return null
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

interface WheelColumnProps {
  label: string
  options: string[]
  selected: string
  onSelect: (option: string) => void
}

/** Coluna em roda: o item central fica nítido e os das pontas recuam. */
function WheelColumn({ label, options, selected, onSelect }: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [center, setCenter] = useState(() => Math.max(0, options.indexOf(selected)))

  useEffect(() => {
    const index = options.indexOf(selected)
    if (index < 0) return
    setCenter(index)
    listRef.current?.scrollTo({ top: index * ITEM_HEIGHT })
  }, [selected, options])

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-(--text-muted)">
        {label}
      </div>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-md"
          style={{ height: ITEM_HEIGHT, background: 'rgba(37,126,140,0.10)' }}
        />
        <div
          ref={listRef}
          className="no-scrollbar relative overflow-y-auto"
          style={{
            height: LIST_HEIGHT,
            scrollSnapType: 'y mandatory',
            paddingBlock: (LIST_HEIGHT - ITEM_HEIGHT) / 2,
          }}
          onScroll={(e) => setCenter(Math.round(e.currentTarget.scrollTop / ITEM_HEIGHT))}
        >
          {options.map((option, index) => {
            const distance = Math.abs(index - center)
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className="block w-full cursor-pointer text-center text-xs tabular-nums transition-[opacity,transform] duration-150"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
                  opacity: Math.max(0.22, 1 - distance * 0.3),
                  transform: `scale(${Math.max(0.78, 1 - distance * 0.08)})`,
                  fontWeight: distance === 0 ? 700 : 400,
                  color: distance === 0 ? '#1D6772' : undefined,
                }}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function TimeSelect({
  value,
  onChange,
  onBlur,
  invalid,
  'aria-label': ariaLabel,
}: TimeSelectProps) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const { hour, minute } = splitTime(value)

  useEffect(() => {
    setTyped(value)
  }, [value])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      setOpen(false)
      onBlur?.()
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
  }, [open, onBlur])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        inputMode="numeric"
        placeholder="--:--"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        value={typed}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setTyped(e.target.value)
          const normalized = normalizeTyped(e.target.value)
          if (normalized) onChange(normalized)
        }}
        onBlur={() => {
          const normalized = normalizeTyped(typed)
          setTyped(normalized ?? value)
        }}
        className={cn(
          'h-9 w-full rounded-lg border bg-white pl-3 pr-9 text-xs tabular-nums transition-all',
          'focus:border-[#257E8C] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#257E8C]/35',
          invalid ? 'border-red-400' : 'border-[#DDE6E6]',
        )}
      />
      <button
        type="button"
        aria-label="Abrir seletor de horário"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="absolute right-0 top-0 flex h-9 w-9 cursor-pointer items-center justify-center text-(--text-muted) transition-colors hover:text-brand"
      >
        <FontAwesomeIcon icon={faClock} style={{ fontSize: 12 }} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={ariaLabel ?? 'Selecionar horário'}
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-(--border-custom) bg-white p-2 shadow-[0_12px_28px_-14px_rgba(16,60,68,0.45)]"
        >
          <div className="flex gap-2">
            <WheelColumn
              label="Hora"
              options={HOURS}
              selected={hour}
              onSelect={(option) => onChange(`${option}:${minute || '00'}`)}
            />
            <WheelColumn
              label="Minuto"
              options={MINUTES}
              selected={minute}
              onSelect={(option) => onChange(`${hour || '00'}:${option}`)}
            />
          </div>

          <div className="mt-2 flex justify-end border-t border-(--border-custom) pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onBlur?.()
              }}
              className="cursor-pointer rounded-md px-2.5 py-1 text-[0.68rem] font-semibold text-brand-dark transition-colors hover:bg-brand/8"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
