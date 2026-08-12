import { format, isSameDay, isToday } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { getApplicationEventColor } from '@/features/scheduling/constants/application-display'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import type { Application } from '@/features/patient/stores/usePatientStore'

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

interface MonthViewProps {
  monthDays: Date[]
  referenceDate: Date
  selectedDate: Date
  onSelectDate: (date: Date) => void
  applicationsByDate: Map<string, Application[]>
  onSelectApplication: (application: Application) => void
}

export function MonthView({
  monthDays,
  referenceDate,
  selectedDate,
  onSelectDate,
  applicationsByDate,
  onSelectApplication,
}: MonthViewProps) {
  const { getName } = useImmunotherapyLookup()

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-(--border-custom)">
        {WEEKDAY_LABELS.map((weekdayLabel) => (
          <div
            key={weekdayLabel}
            className="text-center py-2 text-[0.6rem] font-semibold text-(--text-muted) uppercase"
          >
            {weekdayLabel}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((day) => {
          const applications = applicationsByDate.get(format(day, 'dd/MM/yyyy')) ?? []
          const isCurrentMonth = day.getMonth() === referenceDate.getMonth()
          const today = isToday(day)
          const selected = isSameDay(day, selectedDate)
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                'border-r border-b border-(--border-custom) last:border-r-0 p-1.5 min-h-20 cursor-pointer transition-colors relative',
                !isCurrentMonth && 'opacity-40 bg-gray-50',
                today ? 'bg-brand/8 hover:bg-brand/12' : 'hover:bg-brand/6',
                selected && 'ring-2 ring-brand ring-inset',
              )}
            >
              {today && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand" />
              )}
              <div
                className={cn(
                  'text-[0.65rem] font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full',
                  today ? 'bg-brand text-white' : 'text-(--text-muted) font-semibold',
                )}
              >
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {applications.slice(0, 2).map((application) => {
                  const color = getApplicationEventColor(application)
                  return (
                    <div
                      key={application.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectApplication(application)
                      }}
                      className={cn(
                        'rounded px-1 py-0.5 text-[0.55rem] font-medium truncate backdrop-blur-md cursor-pointer hover:opacity-80 transition-opacity',
                        application.status === 'missed' && 'opacity-70',
                      )}
                      style={{ backgroundColor: color.bg, backgroundImage: color.grad, color: color.text }}
                    >
                      {application.startTime} · {getName(application.patientId)}
                    </div>
                  )
                })}
                {applications.length > 2 && (
                  <div className="text-[0.55rem] text-(--text-muted) px-1">
                    +{applications.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
