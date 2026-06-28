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
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all',
                  active
                    ? 'bg-brand text-white'
                    : done
                    ? 'bg-teal-100 text-brand-dark opacity-50'
                    : 'bg-gray-200 text-gray-500',
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-[0.85rem] font-medium',
                  active ? 'text-brand-dark' : done ? 'text-brand-dark opacity-50' : 'text-gray-400',
                )}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className="relative h-[2.5px] w-16 overflow-hidden rounded-full bg-gray-200"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out',
                    done ? 'bg-teal-100 opacity-50' : 'bg-brand',
                  )}
                  style={{
                    width: done ? '100%' : '0%',
                  }}
                />
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
