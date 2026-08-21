import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getApplicationEventColor } from '@/features/scheduling/constants/application-display'
import { useImmunotherapyLookup } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import type { Application } from '@/features/patient/stores/usePatientStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

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
  const [collapsed, setCollapsed] = useState(false)

  if (applications.length === 0) return null

  return (
    <div className="border-t border-(--border-custom) px-5 py-3 bg-white/50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          <span className="ml-1.5 text-[0.55rem] font-medium lowercase">
            ({applications.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {googleConnected && (
            <span className="text-[0.5rem] text-(--text-muted) flex items-center gap-1">
              <FontAwesomeIcon icon={faCalendar} style={{ fontSize: 9 }} />
              Sincronizado com Google Agenda
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expandir' : 'Minimizar'}
            className="text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer"
          >
            {collapsed ? <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 16 }} /> : <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: 16 }} />}
          </button>
        </div>
      </div>
      <div
        className={`transition-[max-height,opacity] duration-300 ease-out overflow-hidden ${collapsed ? 'max-h-0 opacity-0' : 'max-h-44 opacity-100'}`}
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
        {applications.map((application) => {
          const modalityColor = getApplicationEventColor(application)
          return (
            <div
              key={application.id}
              onClick={() => onSelectApplication(application)}
              className="group relative shrink-0 rounded-lg p-2.5 min-w-45 cursor-pointer hover:brightness-95 hover:-translate-y-px backdrop-blur-sm transition-all"
              style={{
                backgroundColor: modalityColor.bg,
                backgroundImage: modalityColor.grad,
                color: modalityColor.text,
                boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
              }}
            >
              <div className="text-xs font-semibold">{getName(application.patientId)}</div>
              <div className="text-[0.65rem] opacity-90 mt-0.5">
                {application.startTime} – {application.endTime}
              </div>
              <div className="text-[0.6rem] font-medium opacity-90 mt-1.5">{application.dose}</div>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
