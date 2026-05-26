import { useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { IconButton } from '@/shared/components'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import type { Application } from '@/features/patient/stores/patient-store'

interface ApplicationsCalendarProps {
  month: number
  year: number
  appsByDate: Record<string, Application[]>
  onMonthChange: (month: number, year: number) => void
  onSelect: (app: Application) => void
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function ApplicationsCalendar({ month, year, appsByDate, onMonthChange, onSelect }: ApplicationsCalendarProps) {
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const arr: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let i = 1; i <= daysInMonth; i++) arr.push(i)
    return arr
  }, [month, year])

  const monthLabel = (() => {
    const raw = format(new Date(year, month, 1), "MMMM 'de' yyyy", { locale: ptBR })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  })()

  const goPrev = () => {
    if (month === 0) onMonthChange(11, year - 1)
    else onMonthChange(month - 1, year)
  }
  const goNext = () => {
    if (month === 11) onMonthChange(0, year + 1)
    else onMonthChange(month + 1, year)
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <IconButton aria-label="Mês anterior" size="sm" onClick={goPrev} className="border border-(--border-custom)">
          <ChevronLeft size={14} />
        </IconButton>
        <span className="text-xs font-bold text-(--text)">{monthLabel}</span>
        <IconButton aria-label="Próximo mês" size="sm" onClick={goNext} className="border border-(--border-custom)">
          <ChevronRight size={14} />
        </IconButton>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="bg-gray-50/50 h-18" />
          const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`
          const dayApps = appsByDate[dateStr] || []
          const today = new Date()
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          return (
            <div key={day} className={cn('bg-white h-18 p-1.5 relative', isToday && 'bg-teal-50/40')}>
              <div className={cn('text-[0.6rem] font-semibold mb-1', isToday ? 'text-brand' : 'text-(--text-muted)')}>
                {day}
              </div>
              {dayApps.length > 0 && (
                <div className="space-y-0.5">
                  {dayApps.slice(0, 2).map((app) => {
                    const isCompleted = app.status === 'completed'
                    const isScheduled = app.status === 'scheduled'
                    const isMissed = app.status === 'missed'
                    const hasReaction = app.sideEffect === 'yes'
                    const intColor = getIntervalColor(app.cycle.days)
                    const style = hasReaction
                      ? { backgroundColor: '#FFEDD5', color: '#9A3412', borderColor: '#EA580C' }
                      : isMissed
                      ? { backgroundColor: '#FEF2F2', color: '#991B1B', borderColor: '#EF4444' }
                      : { backgroundColor: intColor.bg, color: intColor.text, borderColor: intColor.dot }
                    return (
                      <button
                        type="button"
                        key={app.id}
                        disabled={!isCompleted}
                        onClick={() => isCompleted && onSelect(app)}
                        className={cn(
                          'w-full rounded px-1 py-0.5 text-[0.45rem] font-semibold truncate flex items-center gap-0.5',
                          isScheduled ? 'cursor-default border-dashed border' :
                          isCompleted ? 'cursor-pointer border' :
                          isMissed ? 'cursor-default border' :
                          'bg-gray-100 text-(--text-muted) border border-gray-200',
                        )}
                        style={style}
                        title={hasReaction ? 'Reação adversa registrada' : isMissed ? 'Aplicação perdida' : undefined}
                      >
                        <span className="truncate">{app.dose}</span>
                      </button>
                    )
                  })}
                  {dayApps.length > 2 && (
                    <div className="text-[0.45rem] text-(--text-muted) font-medium text-center">+{dayApps.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
