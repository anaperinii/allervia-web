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
              today ? 'bg-brand/10 hover:bg-brand/16' : 'hover:bg-brand/10',
              selected && !today && 'bg-brand/12',
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
                      'group relative rounded-md px-2.5 py-1.5 text-[0.6rem] backdrop-blur-sm cursor-pointer hover:brightness-95 transition-all',
                      application.status === 'missed' && 'opacity-70',
                    )}
                    style={{
                      backgroundColor: color.bg,
                      backgroundImage: color.grad,
                      color: color.text,
                      boxShadow: '0 1px 4px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1.5 top-1.5 bottom-1.5 w-[3px] rounded-full"
                      style={{ backgroundColor: color.border }}
                    />
                    <div className="pl-2.5 space-y-0.5">
                      <div className="font-semibold truncate">{getName(application.patientId)}</div>
                      <div className="opacity-75">
                        {application.startTime} – {application.endTime}
                      </div>
                      <div className="opacity-75 truncate">{application.dose}</div>
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
