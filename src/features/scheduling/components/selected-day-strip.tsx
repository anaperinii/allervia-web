import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/immunotherapies-store'
import { usePatientStore } from '@/features/patient/stores/patient-store'
import type { Application } from '@/features/patient/stores/patient-store'
import { APPLICATION_STATUS_DISPLAY } from '@/features/scheduling/constants/application-status'

interface SelectedDayStripProps {
  selectedDate: Date
  applications: Application[]
  googleConnected: boolean
  onSelectApplication: (application: Application) => void
}

export function SelectedDayStrip({
  selectedDate,
  applications,
  googleConnected,
  onSelectApplication,
}: SelectedDayStripProps) {
  const { getName } = useImmunotherapyLookup()
  const setApplicationStatus = usePatientStore((s) => s.setApplicationStatus)

  if (applications.length === 0) return null

  return (
    <div className="border-t border-(--border-custom) px-5 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </div>
        {googleConnected && (
          <span className="text-[0.5rem] text-(--text-muted) flex items-center gap-1">
            <Calendar size={9} />
            Sincronizado com Google Agenda
          </span>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {applications.map((application) => {
          const color = getIntervalColor(application.cycle.days)
          const isMissed = application.status === 'missed'
          const isCompleted = application.status === 'completed'
          const statusDisplay = APPLICATION_STATUS_DISPLAY[application.status]
          return (
            <div
              key={application.id}
              onClick={() => onSelectApplication(application)}
              className={cn(
                'shrink-0 border rounded-lg p-2.5 min-w-45 cursor-pointer hover:shadow-sm transition-all',
                isMissed ? 'border-red-200 bg-red-50/40 hover:border-red-300' :
                isCompleted ? 'border-green-200 bg-green-50/30 hover:border-green-300 opacity-80' :
                'border-(--border-custom) hover:border-brand/50',
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="text-xs font-semibold text-(--text) truncate">{getName(application.patientId)}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn('text-[0.5rem] font-semibold px-1.5 py-px rounded-full', statusDisplay.className)}>
                    {statusDisplay.label}
                  </span>
                  {(isCompleted || isMissed) && (
                    <button
                      type="button"
                      title={isCompleted ? 'Marcar como perdida' : 'Marcar como concluída'}
                      onClick={(e) => {
                        e.stopPropagation()
                        setApplicationStatus(application.id, isCompleted ? 'missed' : 'completed')
                      }}
                      className={cn(
                        'rounded-full p-0.5 transition-colors border',
                        isCompleted
                          ? 'text-green-600 hover:text-red-500 hover:bg-red-50 hover:border-red-200 border-green-200'
                          : 'text-red-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 border-red-200',
                      )}
                      aria-label={isCompleted ? 'Marcar como perdida' : 'Marcar como concluída'}
                    >
                      {isCompleted ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                    </button>
                  )}
                </div>
              </div>
              <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
                {application.startTime} – {application.endTime}
              </div>
              {isMissed && application.delayedDays !== undefined && application.delayedDays > 0 && (
                <div className="flex items-center gap-0.5 mt-1 text-[0.55rem] text-red-600 font-medium">
                  <Clock size={9} />
                  Atrasada {application.delayedDays} dia{application.delayedDays !== 1 ? 's' : ''}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[0.6rem] font-medium text-(--text-muted) truncate">{application.dose}</span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[0.55rem] font-semibold border shrink-0"
                  style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                >
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color.dot }} />
                  {application.cycle.days}d
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
