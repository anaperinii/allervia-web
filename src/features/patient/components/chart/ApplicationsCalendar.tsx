import { useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { IconButton } from '@/shared/components'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import type { Application } from '@/features/patient/stores/usePatientStore'

interface ApplicationsCalendarProps {
  month: number
  year: number
  applicationsByDate: Record<string, Application[]>
  onMonthChange: (month: number, year: number) => void
  onSelect: (application: Application) => void
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function ApplicationsCalendar({ month, year, applicationsByDate, onMonthChange, onSelect }: ApplicationsCalendarProps) {
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
          const dayApplications = applicationsByDate[dateStr] || []
          const today = new Date()
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          return (
            <div
              key={day}
              className={cn(
                'bg-white h-18 p-1.5 relative',
                isToday && 'bg-teal-50/70 ring-1 ring-inset ring-brand z-10',
              )}
            >
              <div className="mb-1 flex items-center">
                <span
                  className={cn(
                    'text-[0.6rem] font-semibold flex items-center justify-center',
                    isToday
                      ? 'h-4 min-w-4 px-1 rounded-full bg-brand text-white'
                      : 'text-(--text-muted)',
                  )}
                >
                  {day}
                </span>
              </div>
              {dayApplications.length > 0 && (
                <div className="space-y-0.5">
                  {dayApplications.slice(0, 2).map((application) => {
                    const isRealized = application.status === 'completed'
                    const isNext = application.status === 'scheduled'
                    const hasReaction = application.sideEffect === 'yes'
                    const intervalColor = getIntervalColor(application.cycle.days)
                    const accent = hasReaction ? '#EA580C' : intervalColor.dot
                    const style = {
                      backgroundColor: hasReaction ? '#FFEDD5' : intervalColor.bg,
                      color: hasReaction ? '#9A3412' : intervalColor.text,
                      borderColor: accent,
                      ['--app-glow' as string]: accent,
                    } as React.CSSProperties
                    return (
                      <button
                        type="button"
                        key={application.id}
                        disabled={!isRealized}
                        onClick={() => isRealized && onSelect(application)}
                        className={cn(
                          'w-full rounded px-1 py-0.5 text-[0.45rem] font-semibold truncate flex items-center gap-0.5 transition-all',
                          isNext ? 'cursor-default border-dashed border' :
                          isRealized ? 'cursor-pointer border hover:-translate-y-px hover:shadow-[0_2px_6px_-3px_var(--app-glow)]' :
                          'bg-gray-100 text-(--text-muted) border border-gray-200',
                        )}
                        style={style}
                        title={hasReaction ? 'Reação adversa registrada' : undefined}
                      >
                        <span className="truncate">{application.dose}</span>
                      </button>
                    )
                  })}
                  {dayApplications.length > 2 && (
                    <div className="text-[0.45rem] text-(--text-muted) font-medium text-center">+{dayApplications.length - 2}</div>
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
