import { format, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { getApplicationEventColor } from '@/features/scheduling/constants/application-display'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import type { Application } from '@/features/patient/stores/usePatientStore'

interface WeekViewProps {
  weekDays: Date[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  applicationsByDate: Map<string, Application[]>
  onSelectApplication: (application: Application) => void
}

export function WeekView({
  weekDays,
  selectedDate,
  onSelectDate,
  applicationsByDate,
  onSelectApplication,
}: WeekViewProps) {
  const { getName } = useImmunotherapyLookup()

  return (
    <div className="grid grid-cols-7 h-full">
      {weekDays.map((day) => {
        const applications = applicationsByDate.get(format(day, 'dd/MM/yyyy')) ?? []
        const today = isToday(day)
        const selected = isSameDay(day, selectedDate)
        return (
          <div
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={cn(
              'border-r border-(--border-custom) last:border-r-0 p-2.5 cursor-pointer transition-colors flex flex-col min-h-0 relative',
              today ? 'bg-teal-50/80 hover:bg-teal-50' : 'hover:bg-teal-50/30',
              selected && !today && 'bg-teal-50/50',
            )}
          >
            {today && (
              <div className="absolute top-0 left-0 right-0 h-0.75 bg-brand rounded-b-sm" />
            )}
            <div className="text-center mb-2">
              <div className="text-[0.6rem] font-semibold text-(--text-muted) uppercase">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={cn('text-lg font-bold mt-0.5', today ? 'text-brand' : 'text-(--text)')}>
                {format(day, 'd')}
              </div>
              <div className={cn('w-1.5 h-1.5 rounded-full mx-auto mt-0.5', today ? 'bg-brand' : 'bg-transparent')} />
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {applications.map((application) => {
                const color = getApplicationEventColor(application)
                return (
                  <div
                    key={application.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectApplication(application)
                    }}
                    className={cn(
                      'rounded-md px-2 py-1.5 text-[0.6rem] border-l-2 cursor-pointer hover:opacity-80 transition-opacity',
                      application.status === 'missed' && 'line-through opacity-70',
                    )}
                    style={{ backgroundColor: color.bg, color: color.text, borderLeftColor: color.border }}
                  >
                    <div className="font-semibold truncate">{getName(application.patientId)}</div>
                    <div className="opacity-75">
                      {application.startTime} · {application.dose.split(' - ')[1]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
