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
              today || selected ? 'bg-[#1d6772]/14' : 'hover:bg-brand/6',
            )}
          >
            {today && (
              <div className="absolute top-0 left-0 right-0 h-0.75 rounded-b-sm z-10" style={{ background: '#1d6772' }} />
            )}
            <div
              className="-mx-2.5 -mt-2.5 px-2.5 pt-2.5 pb-2 mb-2 text-center border-b border-(--border-custom)"
              style={{ background: today || selected ? 'transparent' : '#f9fafb' }}
            >
              {/* Weekday and day number share one line. */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-[0.7rem] font-semibold text-slate-600 uppercase">
                  {format(day, 'EEE', { locale: ptBR })}
                </span>
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-[1.05rem] font-bold',
                    today || selected ? 'text-white' : 'text-(--text)',
                  )}
                  style={today || selected ? { background: '#1d6772' } : undefined}
                >
                  {format(day, 'dd')}
                </span>
              </div>
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
                      backgroundImage:
                        application.status === 'missed'
                          ? `repeating-linear-gradient(45deg, rgba(100,116,139,0.22) 0 1.5px, transparent 1.5px 6px), ${color.grad}`
                          : color.grad,
                      color: color.text,
                      boxShadow: '0 1px 4px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)',
                    }}
                  >
                    <div className="space-y-0.5">
                      <div className="text-[0.72rem] font-bold">
                        {application.startTime} – {application.endTime}
                      </div>
                      <div className="font-semibold opacity-90 truncate">{getName(application.patientId)}</div>
                      <div className="font-medium opacity-90 truncate">{application.dose}</div>
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
