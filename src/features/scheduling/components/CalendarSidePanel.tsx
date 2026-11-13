import { useEffect, useMemo, useRef, useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { useModalityStyle } from '@/features/scheduling/components/modality-colors'
import { APPLICATION_STATUS_DISPLAY } from '@/features/scheduling/constants/application-display'
import type { Application } from '@/features/patient/stores/usePatientStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronLeft, faChevronRight, faClock, faXmark } from '@fortawesome/free-solid-svg-icons'

const STATUS_ICON = {
  scheduled: faClock,
  completed: faCheck,
  missed: faXmark,
  canceled: faXmark,
}

const STATUS_ICON_COLOR = {
  scheduled: 'text-gray-400',
  completed: 'text-emerald-600',
  missed: 'text-red-500',
  canceled: 'text-red-500',
}

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MAX_DOTS = 4

interface CalendarSidePanelProps {
  open: boolean
  onClose: () => void
  selectedDate: Date
  onSelectDate: (date: Date) => void
  applicationsByDate: Map<string, Application[]>
  onSelectApplication: (application: Application) => void
  visibleMonth: Date
  onVisibleMonthChange: (date: Date) => void
}

export function CalendarSidePanel({
  open,
  onClose,
  selectedDate,
  onSelectDate,
  applicationsByDate,
  onSelectApplication,
  visibleMonth,
  onVisibleMonthChange,
}: CalendarSidePanelProps) {
  const modalityStyle = useModalityStyle()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { locale: ptBR })
    const end = endOfWeek(endOfMonth(visibleMonth), { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [visibleMonth])

  const monthLabel = useMemo(() => {
    const label = format(visibleMonth, 'MMMM yyyy', { locale: ptBR })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [visibleMonth])

  const selectedDayApplications = useMemo(
    () => applicationsByDate.get(format(selectedDate, 'dd/MM/yyyy')) ?? [],
    [applicationsByDate, selectedDate],
  )

  const selectedDayLabel = useMemo(() => {
    const label = format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [selectedDate])

  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open)
  const rafRef = useRef<number | null>(null)
  const didMount = useRef(false)

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    if (open) {
      setMounted(true)
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setVisible(true))
        rafRef.current = raf2
      })
      rafRef.current = raf1
      return () => cancelAnimationFrame(rafRef.current ?? raf1)
    }
    setVisible(false)
    const timeout = setTimeout(() => setMounted(false), 220)
    return () => clearTimeout(timeout)
  }, [open])

  if (!mounted) return null

  return (
      <aside
        aria-label="Calendário"
        className={cn(
          'h-full shrink-0 overflow-hidden border-(--border-custom) bg-white transition-all duration-[220ms] ease-out',
          visible ? 'w-[320px] border-l opacity-100' : 'w-0 border-l-0 opacity-0',
        )}
      >
      <div className="flex h-full w-[320px] flex-col">
        <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <button
              type="button"
              onClick={() => onVisibleMonthChange(subMonths(visibleMonth, 1))}
              aria-label="Mês anterior"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-gray-100 hover:text-(--text)"
            >
              <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
            </button>
            <span className="text-[0.82rem] font-bold text-(--text)">{monthLabel}</span>
            <button
              type="button"
              onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
              aria-label="Próximo mês"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-gray-100 hover:text-(--text)"
            >
              <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
            </button>
          </div>

          <div className="grid shrink-0 grid-cols-7">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="pb-1.5 text-center text-[0.58rem] font-semibold uppercase text-(--text-muted)"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid shrink-0 grid-cols-7 gap-y-1">
            {monthDays.map((day) => {
              const dayApplications = applicationsByDate.get(format(day, 'dd/MM/yyyy')) ?? []
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth()
              const today = isToday(day)
              const selected = isSameDay(day, selectedDate)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => onSelectDate(day)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-lg py-1 transition-colors cursor-pointer',
                    !isCurrentMonth && 'opacity-35',
                    selected ? 'bg-[#1d6772] text-white' : 'hover:bg-brand/8',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[0.68rem] font-semibold',
                      selected
                        ? 'text-white'
                        : today
                          ? 'bg-brand/15 text-brand font-bold'
                          : 'text-(--text)',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <span className="flex h-1.5 items-center gap-0.5">
                    {dayApplications.slice(0, MAX_DOTS).map((application) => {
                      const tone = modalityStyle(application)
                      const completed = application.status === 'completed'
                      const dotColor = selected ? tone.base : tone.dot
                      return (
                        <span
                          key={application.id}
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{
                            background: dotColor,
                            opacity: selected && !completed ? 0.45 : 1,
                            boxShadow: selected && completed ? `0 0 5px 1.5px ${dotColor}` : undefined,
                          }}
                        />
                      )
                    })}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-(--border-custom) pt-4">
            <h3 className="mb-2 shrink-0 text-[0.72rem] font-bold text-(--text)">{selectedDayLabel}</h3>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {selectedDayApplications.length === 0 ? (
              <p className="text-[0.7rem] text-(--text-muted)">
                Nenhum compromisso neste dia.
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedDayApplications.map((application) => {
                  const tone = modalityStyle(application)
                  return (
                    <button
                      key={application.id}
                      type="button"
                      onClick={() => onSelectApplication(application)}
                      className="flex w-full cursor-pointer items-start gap-3 rounded-lg border-l-4 bg-gray-100 px-3 py-2.5 text-left text-(--text) transition hover:bg-gray-200"
                      style={{ borderLeftColor: tone.base }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className={cn('text-xs font-bold', application.status === 'completed' && 'font-black')}>
                          {application.startTime}
                          {application.endTime ? ` – ${application.endTime}` : ''}
                        </div>
                        <div className={cn('truncate text-[0.7rem] font-medium opacity-90', application.status === 'completed' && 'font-bold opacity-100')}>
                          {application.patientName} · {application.dose}
                        </div>
                      </div>
                      <FontAwesomeIcon
                        icon={STATUS_ICON[application.status]}
                        className={cn('mt-0.5 shrink-0', STATUS_ICON_COLOR[application.status])}
                        style={{ fontSize: 12 }}
                        title={APPLICATION_STATUS_DISPLAY[application.status].label}
                      />
                    </button>
                  )
                })}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
      </aside>
  )
}
