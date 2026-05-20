import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/immunotherapies-store'
import type { Application } from '@/features/patient/stores/patient-store'

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
          return (
            <div
              key={application.id}
              onClick={() => onSelectApplication(application)}
              className="shrink-0 border border-(--border-custom) rounded-lg p-2.5 min-w-45 cursor-pointer hover:border-brand/50 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-semibold text-(--text)">{getName(application.patientId)}</div>
              <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
                {application.startTime} – {application.endTime}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[0.6rem] font-medium text-(--text-muted)">{application.dose}</span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[0.55rem] font-semibold border"
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
