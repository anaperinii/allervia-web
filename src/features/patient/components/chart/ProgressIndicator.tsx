import { cn } from '@/shared/lib/cn'

const INDUCTION_STEPS = [
  { conc: '1:10.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
  { conc: '1:1.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
  { conc: '1:100', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
  { conc: '1:10', vols: ['0,1ml', '0,2ml', '0,4ml', '0,5ml'] },
] as const

interface ProgressIndicatorProps {
  currentStepIndex: number
  progressPct: number
}

export function ProgressIndicator({ currentStepIndex, progressPct }: ProgressIndicatorProps) {
  return <InductionProgress currentStepIndex={currentStepIndex} progressPct={progressPct} />
}

function InductionProgress({ currentStepIndex, progressPct }: { currentStepIndex: number; progressPct: number }) {
  const safeIdx = currentStepIndex >= 0 ? currentStepIndex : 0
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <div className="mb-4">
        <div className="text-sm font-bold text-(--text)">Progressão da fase de indução</div>
        <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
          Escalonamento da concentração e do volume até atingir a dose meta de manutenção
        </div>
      </div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-brand to-brand-dark rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[0.7rem] font-bold text-brand shrink-0">{progressPct}%</span>
      </div>
      <div className="flex gap-0">
        {INDUCTION_STEPS.map((group, groupIndex) => {
          const startIdx = INDUCTION_STEPS.slice(0, groupIndex).reduce((accumulator, step) => accumulator + step.vols.length, 0)
          const blockActive = safeIdx >= startIdx && safeIdx < startIdx + group.vols.length
          const blockFuture = safeIdx < startIdx
          return (
            <div key={group.conc} className="flex items-center flex-1 min-w-0">
              <div className={cn('flex-1 rounded-md px-2 py-1.5 transition-all', blockFuture && 'opacity-30')}>
                <div className={cn('text-[0.6rem] font-bold mb-1 truncate', blockActive ? 'text-brand' : 'text-(--text-muted)')}>{group.conc}</div>
                <div className="flex gap-0.5 flex-wrap">
                  {group.vols.map((volume, volumeIndex) => {
                    const stepIdx = startIdx + volumeIndex
                    const isCurrent = stepIdx === safeIdx
                    const isDone = stepIdx < safeIdx
                    const isLast = groupIndex === INDUCTION_STEPS.length - 1 && volumeIndex === group.vols.length - 1
                    return (
                      <span
                        key={volumeIndex}
                        className={cn(
                          'text-[0.55rem] px-1 py-px rounded font-semibold',
                          isCurrent ? 'bg-brand text-white outline outline-offset-1 outline-brand' :
                          isDone ? 'bg-slate-200 text-slate-500' :
                          'bg-slate-100 text-slate-400 opacity-40',
                        )}
                      >
                        {volume}{isLast ? ' ★' : ''}
                      </span>
                    )
                  })}
                </div>
              </div>
              {groupIndex < INDUCTION_STEPS.length - 1 && <div className="w-px h-8 bg-gray-300 mx-1 shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const PROGRESS_INDUCTION_STEPS = INDUCTION_STEPS
