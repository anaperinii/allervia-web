import { format, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { EventDots } from '@/features/scheduling/components/EventDots'
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
              today || selected ? 'bg-[#1d6772]/6' : 'hover:bg-brand/6',
            )}
          >
            {today && (
              <div className="absolute top-0 left-0 right-0 h-0.75 rounded-b-sm z-10" style={{ background: '#1d6772' }} />
            )}
            <div
              className="-mx-2.5 -mt-2.5 px-2.5 pt-2.5 pb-2 mb-2 text-center border-b border-(--border-custom)"
              style={{ background: today || selected ? 'transparent' : '#f9fafb' }}
            >
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
              {applications.map((application) => (
                // Formato de pasta: aba com o horário, curva côncava para fora
                // e as bolinhas flutuando no vão à direita da aba.
                <div
                  key={application.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectApplication(application)
                  }}
                  className={cn(
                    'group relative cursor-pointer text-[0.6rem] text-(--text) transition-all hover:-translate-y-px',
                    application.status === 'missed' && 'opacity-70',
                  )}
                >
                  <div className="relative flex items-end">
                    <span className="relative z-10 block min-w-[64%] max-w-[84%] truncate rounded-t-lg bg-white px-2 pb-0.5 pt-1 text-[0.68rem] font-bold">
                      {application.startTime}
                      {application.endTime ? ` – ${application.endTime}` : ''}
                    </span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none relative z-10 -ml-px block h-2.5 w-2.5 self-end"
                      style={{
                        background:
                          'radial-gradient(circle at 100% 0%, transparent 9.5px, #ffffff 10px)',
                      }}
                    />
                    <span className="absolute bottom-0.5 right-0 z-20">
                      <EventDots application={application} />
                    </span>
                  </div>
                  <div
                    className="space-y-0.5 rounded-b-lg rounded-tr-lg bg-white px-2.5 pb-1.5 pt-1"
                    style={{
                      backgroundImage:
                        application.status === 'missed'
                          ? 'repeating-linear-gradient(45deg, rgba(100,116,139,0.14) 0 1.5px, transparent 1.5px 6px)'
                          : undefined,
                      boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.05)',
                    }}
                  >
                    <div className="font-semibold text-(--text) truncate">{application.patientName ?? ''}</div>
                    <div className="font-medium text-(--text-muted) truncate">{application.dose}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
