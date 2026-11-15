import { format, isBefore, isSameDay, isToday, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { useModalityStyle } from '@/features/scheduling/components/modality-colors'
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
  const modalityStyle = useModalityStyle()
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
                    selected ? 'text-white' : 'text-(--text)',
                  )}
                  style={selected ? { background: '#1d6772' } : undefined}
                >
                  {format(day, 'dd')}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {applications.map((application) => {
                const tone = modalityStyle(application)
                const isOverdue = application.status === 'scheduled' && isBefore(day, startOfDay(new Date()))
                const showHatch = application.status === 'missed' || isOverdue
                return (
                <div
                  key={application.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectApplication(application)
                  }}
                  className={cn(
                    'group relative cursor-pointer space-y-0.5 overflow-hidden rounded-lg border px-2.5 py-1.5 text-[0.6rem] transition-all hover:-translate-y-px',
                    showHatch && 'px-3.5',
                  )}
                  style={{
                    background: tone.surface,
                    borderColor: tone.border,
                    color: tone.ink,
                  }}
                >
                  {showHatch && (
                    <>
                      <span className="absolute inset-y-0 left-0 w-2" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${tone.border} 0 3px, transparent 3px 6px)` }} />
                      <span className="absolute inset-y-0 right-0 w-2" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${tone.border} 0 3px, transparent 3px 6px)` }} />
                    </>
                  )}
                  <div className={cn('truncate text-[0.68rem] font-bold', application.status === 'completed' && 'font-black')}>
                    {application.startTime}
                    {application.endTime ? ` – ${application.endTime}` : ''}
                  </div>
                  <div className={cn('truncate font-semibold', application.status === 'completed' && 'font-extrabold')}>
                    {application.patientName ?? ''}
                  </div>
                  <div className={cn('truncate font-medium opacity-75', application.status === 'completed' && 'font-bold opacity-90')}>
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
