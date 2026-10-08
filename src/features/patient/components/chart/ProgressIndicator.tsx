import { cn } from '@/shared/lib/cn'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'

interface ProgressIndicatorProps {
  steps: ProtocolStep[]
  currentStepId: string | null
}

export function ProgressIndicator({ steps, currentStepId }: ProgressIndicatorProps) {
  if (steps.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg px-4 py-3 text-[0.7rem] text-(--text-muted)">
        Este tratamento não tem prescrição configurada vinculada; a progressão fica
        disponível após a migração assistida.
      </div>
    )
  }

  const currentIndex = currentStepId
    ? steps.findIndex((step) => step.id === currentStepId)
    : -1
  const progressPct =
    currentIndex >= 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0

  const groups: { concentration: string; steps: { step: ProtocolStep; index: number }[] }[] = []
  steps.forEach((step, index) => {
    const label = `1:${Number(step.concentration).toLocaleString('pt-BR')}`
    const last = groups[groups.length - 1]
    if (last && last.concentration === label) {
      last.steps.push({ step, index })
    } else {
      groups.push({ concentration: label, steps: [{ step, index }] })
    }
  })

  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <div className="mb-4">
        <div className="text-sm font-bold text-(--text)">Progressão da prescrição</div>
        <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
          Etapas permitidas pela versão fixada do protocolo, do início à meta
        </div>
      </div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-brand to-brand-dark rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[0.7rem] font-bold text-brand shrink-0">{progressPct}%</span>
      </div>
      <div className="flex gap-0 flex-wrap">
        {groups.map((group, groupIndex) => {
          const firstIndex = group.steps[0].index
          const lastIndex = group.steps[group.steps.length - 1].index
          const blockActive = currentIndex >= firstIndex && currentIndex <= lastIndex
          const blockFuture = currentIndex < firstIndex
          return (
            <div key={`${group.concentration}-${firstIndex}`} className="flex items-center flex-1 min-w-24">
              <div className={cn('flex-1 rounded-md px-2 py-1.5 transition-all', blockFuture && currentIndex >= 0 && 'opacity-30')}>
                <div className={cn('text-[0.6rem] font-bold mb-1 truncate', blockActive ? 'text-brand' : 'text-(--text-muted)')}>
                  {group.concentration}
                </div>
                <div className="flex gap-0.5 flex-wrap">
                  {group.steps.map(({ step, index }) => {
                    const isCurrent = index === currentIndex
                    const isDone = currentIndex >= 0 && index < currentIndex
                    const isLast = index === steps.length - 1
                    return (
                      <span
                        key={step.id}
                        title={step.label}
                        className={cn(
                          'text-[0.55rem] px-1 py-px rounded font-semibold',
                          isCurrent ? 'bg-brand text-white outline outline-offset-1 outline-brand' :
                          isDone ? 'bg-slate-200 text-slate-500' :
                          'bg-slate-100 text-slate-400 opacity-40',
                        )}
                      >
                        {step.volume.replace('.', ',')}ml{isLast ? ' ★' : ''}
                      </span>
                    )
                  })}
                </div>
              </div>
              {groupIndex < groups.length - 1 && <div className="w-px h-8 bg-gray-300 mx-1 shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
