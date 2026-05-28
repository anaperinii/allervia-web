import { cn } from '@/shared/lib/utils'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { usePatientStore } from '@/features/patient/stores/patient-store'
import type { Application } from '@/features/patient/stores/patient-store'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface ApplicationsTimelineProps {
  grouped: Record<string, Application[]>
  onSelect: (app: Application) => void
}

export function ApplicationsTimeline({ grouped, onSelect }: ApplicationsTimelineProps) {
  const setApplicationStatus = usePatientStore((s) => s.setApplicationStatus)
  const entries = Object.entries(grouped)

  if (entries.length === 0) {
    return <div className="text-center text-xs text-(--text-muted) py-10">Nenhuma aplicação encontrada neste período.</div>
  }

  return (
    <div className="relative pl-7">
      {entries.map(([monthYear, apps]) => (
        <div key={monthYear} className="mb-7 last:mb-0">
          <div className="flex items-center gap-1.5 mb-2 -ml-7">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.5px] text-(--text-muted)">{monthYear}</span>
            <span className="text-[0.55rem] bg-gray-100 text-(--text-muted) border border-(--border-custom) px-1.5 py-px rounded-full">
              {apps.length} aplicaç{apps.length === 1 ? 'ão' : 'ões'}
            </span>
          </div>

          <div className="relative">
            <div className="absolute -left-3.75 top-0 bottom-0 w-px bg-gray-200 rounded-full" />
            {apps.map((app, idx) => {
              const color = getIntervalColor(app.cycle.days)
              const isCompleted = app.status === 'completed'
              const isMissed = app.status === 'missed'
              const isScheduled = app.status === 'scheduled'
              const hasReaction = app.sideEffect === 'yes'

              const nodeColor = hasReaction ? '#EA580C'
                : isMissed ? '#EF4444'
                : isScheduled ? '#0d9488'
                : '#2dd4bf'

              return (
                <div key={app.id} className="relative mb-2.5 last:mb-0" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <div className="absolute -left-6.25 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColor }} />
                    </div>
                  </div>

                  <div
                    className={cn(
                      'w-full rounded-lg border p-3 ml-1 transition-all',
                      hasReaction ? 'border-orange-300 bg-orange-50/40' :
                      isMissed ? 'border-red-200 bg-red-50/40' :
                      isScheduled ? 'border-teal-400 bg-teal-50/60' :
                      'border-(--border-custom) bg-white',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Clicável só para completed (ver detalhes) */}
                      <button
                        type="button"
                        disabled={!isCompleted}
                        onClick={() => isCompleted && onSelect(app)}
                        className={cn('text-left flex-1', isCompleted ? 'cursor-pointer' : 'cursor-default')}
                      >
                        <div className="text-xs font-bold text-(--text) flex items-center gap-1.5">
                          {app.dose}
                          {hasReaction && <span className="text-[0.55rem] font-bold text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-px rounded-full">REAÇÃO</span>}
                          {isMissed && app.delayedDays !== undefined && app.delayedDays > 0 && (
                            <span className="text-[0.55rem] font-bold text-red-700 bg-red-100 border border-red-200 px-1.5 py-px rounded-full flex items-center gap-0.5">
                              <Clock size={9} />
                              Atrasada {app.delayedDays}d
                            </span>
                          )}
                        </div>
                        <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
                          {app.date} · {app.startTime}–{app.endTime}
                        </div>
                      </button>

                      {/* Controles de status (completed ↔ missed) */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isScheduled && (
                          <span className="text-[0.55rem] font-semibold px-1.5 py-px rounded-full border bg-teal-50 text-teal-700 border-teal-200">
                            Agendada
                          </span>
                        )}

                        {/* Badge de status + toggle para completed/missed */}
                        {(isCompleted || isMissed) && (
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              'text-[0.55rem] font-semibold px-1.5 py-px rounded-full border',
                              isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200',
                            )}>
                              {isCompleted ? 'Concluída' : 'Perdida'}
                            </span>
                            <button
                              type="button"
                              title={isCompleted ? 'Marcar como perdida' : 'Marcar como concluída'}
                              onClick={() => setApplicationStatus(app.id, isCompleted ? 'missed' : 'completed')}
                              className={cn(
                                'rounded-full p-0.5 transition-colors border',
                                isCompleted
                                  ? 'text-green-600 hover:text-red-500 hover:bg-red-50 hover:border-red-200 border-green-200'
                                  : 'text-red-500 hover:text-green-600 hover:bg-green-50 hover:border-green-200 border-red-200',
                              )}
                              aria-label={isCompleted ? 'Marcar como perdida' : 'Marcar como concluída'}
                            >
                              {isCompleted
                                ? <CheckCircle2 size={13} />
                                : <AlertCircle size={13} />}
                            </button>
                          </div>
                        )}

                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-px rounded-full text-[0.65rem] font-semibold border"
                          style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                          {app.cycle.days} dias
                        </span>
                      </div>
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
