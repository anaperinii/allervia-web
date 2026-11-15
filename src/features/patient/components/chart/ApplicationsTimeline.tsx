import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/cn'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { parsePtDate } from '@/shared/lib/dates'
import type { Application } from '@/features/patient/stores/usePatientStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faClock } from '@fortawesome/free-solid-svg-icons'

const APPOINTMENT_STATUS_ICON = {
  scheduled: faClock,
  completed: faCircleCheck,
  missed: faCircleXmark,
  canceled: faCircleXmark,
} as const

const APPOINTMENT_STATUS_ICON_COLOR = {
  scheduled: 'text-gray-400',
  completed: 'text-green-500',
  missed: 'text-red-500',
  canceled: 'text-red-500',
} as const

interface ApplicationsTimelineProps {
  applicationsByMonth: Record<string, Application[]>
  onSelect: (application: Application) => void
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const withSmallMl = (value: string) =>
  value.split(/(ml)/gi).map((part, index) =>
    /^ml$/i.test(part) ? <span key={index} className="text-[0.8em] ml-0.5">{part}</span> : part,
  )

function daysOverdue(brDate: string): number {
  const [day, month, year] = brDate.split('/').map(Number)
  if (!day || !month || !year) return 0
  const target = new Date(year, month - 1, day)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - target.getTime()) / 86400000)
}

export function ApplicationsTimeline({ applicationsByMonth, onSelect }: ApplicationsTimelineProps) {
  const entries = Object.entries(applicationsByMonth)
  if (entries.length === 0) {
    return <div className="text-center text-xs text-(--text-muted) py-10">Nenhuma aplicação encontrada neste período.</div>
  }
  return (
    <div>
      {entries.map(([monthYear, monthApplications]) => (
        <div key={monthYear} className="mb-7 last:mb-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.5px] text-(--text-muted)">
              {monthYear} <span className="font-semibold">({monthApplications.length})</span>
            </span>
          </div>

          <div className="space-y-3.5">
            {monthApplications.map((application) => {
              const color = getIntervalColor(application.cycle.days)
              const isNext = application.status === 'scheduled'
              const hasReaction = application.sideEffect === 'yes'
              const overdueDays = isNext ? daysOverdue(application.date) : 0
              const interactive = true
              const dateObj = parsePtDate(application.date)
              const day = format(dateObj, 'dd')
              const monthAbbr = capitalize(format(dateObj, 'MMM', { locale: ptBR }).replace('.', ''))
              const weekday = capitalize(format(dateObj, 'EEEE', { locale: ptBR }))
              const accentText = isNext ? 'text-teal-600' : 'text-(--text)'
              const accentMuted = isNext ? 'text-teal-600/70' : 'text-(--text-muted)'
              return (
                <div
                  key={application.id}
                  role={interactive ? 'button' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={() => interactive && onSelect(application)}
                  onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(application) } } : undefined}
                  className={cn(
                    'relative w-full text-left rounded-lg border transition-all flex items-stretch',
                    isNext ? 'border-(--border-custom) bg-linear-to-r from-teal-50/70 to-transparent' :
                    'border-(--border-custom) bg-white hover:shadow-[0_2px_8px_rgba(20,184,166,0.1)]',
                    interactive ? 'cursor-pointer' : 'cursor-default',
                  )}
                >
                  <div className="flex w-18 shrink-0 flex-col items-center justify-center py-2.5">
                    <span className={cn('text-[0.7rem] leading-none', isNext ? 'font-bold' : 'font-normal', accentMuted)}>{monthAbbr}</span>
                    <span className={cn('leading-tight', isNext ? 'text-3xl font-black' : 'text-2xl font-semibold', accentText)}>{day}</span>
                  </div>

                  <div className="w-px self-stretch bg-gray-200 my-2" />

                  <div className="flex-1 min-w-0 px-5 py-2.5">
                    <div className={cn('flex items-center gap-1.5 text-[0.8rem] text-(--text-muted)', isNext && 'font-semibold')}>
                      {weekday}, {application.startTime}
                      {application.endTime ? `–${application.endTime}` : ''}
                      <FontAwesomeIcon
                        icon={APPOINTMENT_STATUS_ICON[application.status]}
                        className={APPOINTMENT_STATUS_ICON_COLOR[application.status]}
                        style={{ fontSize: 10 }}
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className={cn('text-sm text-(--text-muted)', application.isAppointment && 'text-[0.85rem]', isNext && 'font-semibold')}>{withSmallMl(application.dose)}</span>
                      {application.isAppointment ? (
                        <span className="rounded-md bg-gray-200 text-gray-700 text-[0.55rem] font-bold uppercase tracking-wide px-1.5 py-0.5">
                          Compromisso
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-1.5 py-px rounded-md text-[0.55rem] font-semibold border"
                          style={{ backgroundColor: color.bg + '4D', color: color.text, borderColor: color.dot + '30' }}
                        >
                          {application.cycle.days} dias
                        </span>
                      )}
                      {overdueDays > 0 && (
                        <span className="rounded-md bg-red-400 text-white text-[0.55rem] font-bold uppercase tracking-wide px-1.5 py-0.5">
                          Atrasada há {overdueDays} {overdueDays === 1 ? 'dia' : 'dias'}
                        </span>
                      )}
                      {hasReaction && (
                        <span className="rounded-md bg-[#C46A3C] text-white text-[0.55rem] font-bold uppercase tracking-wide px-1.5 py-0.5">
                          Reação registrada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
