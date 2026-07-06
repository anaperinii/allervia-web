import { cn } from '@/shared/lib/cn'

interface WizardStepsIndicatorProps {
  labels: readonly string[]
  current: number
  ariaLabel?: string
}

export function WizardStepsIndicator({ labels, current, ariaLabel = 'Etapas' }: WizardStepsIndicatorProps) {
  return (
    <ol className="px-5 pt-10 pb-7 flex items-center justify-center gap-5 list-none m-0" aria-label={ariaLabel}>
      {labels.map((label, i) => {
        const active = current === i
        const done = current > i
        return (
          <li key={label} className="flex items-center gap-5">
            <div className="flex items-center gap-2.5" aria-current={active ? 'step' : undefined}>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[0.7rem] font-semibold transition-all',
                  active
                    ? 'bg-brand text-white shadow-[0_0_14px_2px_rgba(108,158,165,0.55)]'
                    : done
                    ? 'bg-brand/40 text-brand-dark shadow-[0_0_10px_1px_rgba(108,158,165,0.3)]'
                    : 'bg-gray-300 text-gray-600 shadow-[0_0_8px_1px_rgba(148,163,184,0.4)]',
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-[0.85rem] font-medium',
                  active ? 'text-brand-dark' : done ? 'text-brand-dark opacity-50' : 'text-gray-500',
                )}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                aria-hidden="true"
                className="h-px w-16"
                style={{
                  background: done
                    ? 'linear-gradient(to right, transparent 0%, rgba(108,158,165,0.5) 50%, transparent 100%)'
                    : 'linear-gradient(to right, transparent 0%, rgba(148,163,184,0.4) 50%, transparent 100%)',
                }}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
