import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { getApplicationEventColor } from '@/features/scheduling/constants/application-display'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import type { Application } from '@/features/patient/stores/usePatientStore'

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

  if (applications.length === 0) return null

  return (
    <div className="border-t border-(--border-custom) px-5 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          <span className="ml-1.5 text-[0.55rem] font-medium normal-case lowercase">
            ({applications.length})
          </span>
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
          const modalityColor = getApplicationEventColor(application)
          return (
            <div
              key={application.id}
              onClick={() => onSelectApplication(application)}
              className="group relative shrink-0 rounded-lg p-2.5 pl-4 min-w-45 cursor-pointer hover:brightness-95 hover:-translate-y-px backdrop-blur-sm transition-all"
              style={{
                backgroundColor: modalityColor.bg + '80',
                color: modalityColor.text,
                boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
              }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1.5 top-2 bottom-2 w-[3px] rounded-full"
                style={{ backgroundColor: modalityColor.border }}
              />
              <div className="text-xs font-semibold">{getName(application.patientId)}</div>
              <div className="text-[0.65rem] opacity-75 mt-0.5">
                {application.startTime} – {application.endTime}
              </div>
              <div className="text-[0.6rem] font-medium opacity-75 mt-1.5">{application.dose}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
