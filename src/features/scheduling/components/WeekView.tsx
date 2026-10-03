import { format, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { modalityStyle } from '@/features/scheduling/components/modality-colors'
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
              {applications.map((application) => {
                const tone = modalityStyle(application)
                return (
                <div
                  key={application.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectApplication(application)
                  }}
                  className={cn(
                    'group cursor-pointer space-y-0.5 rounded-lg border px-2.5 py-1.5 text-[0.6rem] transition-all hover:-translate-y-px',
                    application.status === 'missed' && 'opacity-70',
                  )}
                  style={{
                    background: tone.surface,
                    borderColor: tone.border,
                    color: tone.ink,
                    backgroundImage:
                      application.status === 'missed'
                        ? 'repeating-linear-gradient(45deg, rgba(100,116,139,0.14) 0 1.5px, transparent 1.5px 6px)'
                        : undefined,
                  }}
                >
                  <div className="truncate text-[0.68rem] font-bold">
                    {application.startTime}
                    {application.endTime ? ` – ${application.endTime}` : ''}
                  </div>
                  <div className="truncate font-semibold">{application.patientName ?? ''}</div>
                  <div className="truncate font-medium opacity-75">
                    {application.dose} · {application.cycle.days} dias
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
