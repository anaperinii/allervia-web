import { cn } from '@/shared/lib/cn'
import type { Application } from '@/features/patient/stores/usePatientStore'

const INDUCTION_STEPS = [
  { conc: '1:10.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
  { conc: '1:1.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
  { conc: '1:100', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
  { conc: '1:10', vols: ['0,1ml', '0,2ml', '0,4ml', '0,5ml'] },
] as const

const MAINTENANCE_INTERVALS = [
  { days: 14, label: '14 dias' },
  { days: 21, label: '21 dias' },
  { days: 28, label: '28 dias ★' },
] as const

interface ProgressIndicatorProps {
  open: boolean
  patientApplications: Application[]
  isMaintenance: boolean
  currentInterval: number
  currentStepIndex: number
  progressPct: number
}

export function ProgressIndicator({
  open,
  patientApplications,
  isMaintenance,
  currentInterval,
  currentStepIndex,
  progressPct,
}: ProgressIndicatorProps) {
  return (
    <div className={cn('overflow-hidden transition-all duration-300', open ? 'max-h-80 opacity-100 mb-3' : 'max-h-0 opacity-0')}>
      <InductionProgress currentStepIndex={currentStepIndex} progressPct={progressPct} />
      <MaintenanceTimeline patientApplications={patientApplications} isMaintenance={isMaintenance} currentInterval={currentInterval} />
    </div>
  )
}

function InductionProgress({ currentStepIndex, progressPct }: { currentStepIndex: number; progressPct: number }) {
  const safeIdx = currentStepIndex >= 0 ? currentStepIndex : 0
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-(--text-muted)">Progressão da indução</span>
        <span className="text-[0.7rem] font-bold text-brand">{progressPct}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-linear-to-r from-brand to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="flex gap-0">
        {INDUCTION_STEPS.map((group, groupIndex) => {
          const startIdx = INDUCTION_STEPS.slice(0, groupIndex).reduce((accumulator, step) => accumulator + step.vols.length, 0)
          const blockActive = safeIdx >= startIdx && safeIdx < startIdx + group.vols.length
          const blockFuture = safeIdx < startIdx
          return (
            <div key={group.conc} className="flex items-center flex-1 min-w-0">
              <div className={cn('flex-1 rounded-md px-2 py-1.5 transition-all', blockFuture && 'opacity-30')}>
                <div className={cn('text-[0.5rem] font-bold mb-1 truncate', blockActive ? 'text-brand' : 'text-(--text-muted)')}>{group.conc}</div>
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
                          'text-[0.45rem] px-1 py-px rounded font-semibold',
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

function MaintenanceTimeline({ patientApplications, isMaintenance, currentInterval }: { patientApplications: Application[]; isMaintenance: boolean; currentInterval: number }) {
  const maintenanceApplications = patientApplications.filter((application) => application.status === 'completed' && application.cycle.days >= 14)
  const fillWidth = !isMaintenance
    ? '0%'
    : currentInterval >= 28
    ? 'calc(100% - 48px)'
    : currentInterval >= 21
    ? 'calc(50%)'
    : '0%'

  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3 mt-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-(--text-muted)">Progressão da manutenção</span>
        <span className="text-[0.55rem] text-(--text-muted)">Meta · 28 dias (estável)</span>
      </div>
      <div className="flex items-start justify-between relative px-2">
        <div className="absolute top-2.25 left-6 right-6 h-px bg-gray-300" />
        <div className="absolute top-2.25 left-6 h-px bg-violet-400 transition-all duration-700" style={{ width: fillWidth }} />
        {MAINTENANCE_INTERVALS.map((step) => {
          const isActive = isMaintenance && currentInterval >= step.days
          const firstApplication = maintenanceApplications.find((application) => application.cycle.days === step.days)
          return (
            <div key={step.days} className="flex flex-col items-center z-10">
              <div className={cn(
                'w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all',
                isActive ? 'bg-violet-400 border-violet-400' : 'bg-white border-gray-300',
              )}>
                {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="w-px h-3 bg-gray-300 mt-0.5" />
              <div className={cn('text-center mt-1', !isActive && 'opacity-40')}>
                <div className={cn('text-[0.55rem] font-bold', isActive ? 'text-violet-600' : 'text-(--text-muted)')}>
                  {step.label}
                </div>
                <div className="text-[0.45rem] text-(--text-muted)">
                  {firstApplication ? firstApplication.date : '—'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const PROGRESS_INDUCTION_STEPS = INDUCTION_STEPS
