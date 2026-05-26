import { cn } from '@/shared/lib/utils'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import type { Application } from '@/features/patient/stores/usePatientStore'

interface ApplicationsTimelineProps {
  applicationsByMonth: Record<string, Application[]>
  onSelect: (application: Application) => void
}

export function ApplicationsTimeline({ applicationsByMonth, onSelect }: ApplicationsTimelineProps) {
  const entries = Object.entries(applicationsByMonth)
  if (entries.length === 0) {
    return <div className="text-center text-xs text-(--text-muted) py-10">Nenhuma aplicação encontrada neste período.</div>
  }
  return (
    <div className="relative pl-7">
      {entries.map(([monthYear, monthApplications]) => (
        <div key={monthYear} className="mb-7 last:mb-0">
          <div className="flex items-center gap-1.5 mb-2 -ml-7">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.5px] text-(--text-muted)">{monthYear}</span>
            <span className="text-[0.55rem] bg-gray-100 text-(--text-muted) border border-(--border-custom) px-1.5 py-px rounded-full">
              {monthApplications.length} aplicaç{monthApplications.length === 1 ? 'ão' : 'ões'}
            </span>
          </div>

          <div className="relative">
            <div className="absolute -left-3.75 top-0 bottom-0 w-px bg-gray-200 rounded-full" />
            {monthApplications.map((application, index) => {
              const color = getIntervalColor(application.cycle.days)
              const isRealized = application.status === 'completed'
              const isNext = application.status === 'scheduled'
              const hasReaction = application.sideEffect === 'yes'
              const nodeColor = hasReaction ? '#EA580C' : isNext ? '#0d9488' : '#2dd4bf'
              const interactive = isRealized
              return (
                <div key={application.id} className="relative mb-2.5 last:mb-0" style={{ animationDelay: `${index * 0.06}s` }}>
                  <div className="absolute -left-6.25 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColor }} />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onSelect(application)}
                    className={cn(
                      'w-full text-left rounded-lg border p-3 ml-1 transition-all block',
                      hasReaction ? 'border-orange-300 bg-orange-50/40 hover:border-orange-400' :
                      isNext ? 'border-teal-400 bg-teal-50/60' :
                      'border-(--border-custom) bg-white hover:translate-x-0.5 hover:shadow-[0_2px_8px_rgba(20,184,166,0.1)]',
                      interactive ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-xs font-bold text-(--text) flex items-center gap-1.5">
                            {application.dose}
                            {hasReaction && <span className="text-[0.55rem] font-bold text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-px rounded-full">REAÇÃO</span>}
                          </div>
                          <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
                            {application.date} · {application.startTime}–{application.endTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isNext && <span className="text-[0.6rem] font-bold text-teal-700">PRÓXIMA</span>}
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-px rounded-full text-[0.65rem] font-semibold border"
                          style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                          {application.cycle.days} dias
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
