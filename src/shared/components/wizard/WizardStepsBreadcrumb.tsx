import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/shared/lib/cn'
import { SHOWCASE } from '@/shared/components/showcase'

export interface WizardStep {
  label: string
  description?: string
  icon?: IconDefinition
}

interface WizardStepsBreadcrumbProps {
  steps: WizardStep[]
  current: number
  onSelect?: (index: number) => void
  ariaLabel?: string
}

export function WizardStepsBreadcrumb({
  steps,
  current,
  onSelect,
  ariaLabel = 'Etapas',
}: WizardStepsBreadcrumbProps) {
  return (
    <ol className="flex list-none items-center m-0 p-0" aria-label={ariaLabel}>
      {steps.map((step, i) => {
        const active = i === current
        const clickable = i < current && Boolean(onSelect)

        return (
          <li
            key={step.label}
            className={cn('relative', i > 0 && '-ml-5')}
            style={{ zIndex: steps.length - i }}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelect?.(i)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'relative flex h-8 items-center gap-2 overflow-hidden rounded-full pl-4 pr-5 text-[0.72rem] font-medium whitespace-nowrap transition-all duration-300',
                i > 0 && 'pl-7',
                clickable ? 'cursor-pointer' : 'cursor-default',
              )}
              style={{
                background: active ? SHOWCASE.ink : SHOWCASE.white,
                border: active ? '1px solid transparent' : `1px solid ${SHOWCASE.line}`,
                color: active ? SHOWCASE.onAccent : SHOWCASE.muted,
                boxShadow: active ? '0 4px 12px -6px rgba(16,60,68,0.30)' : '0 1px 4px rgba(16,60,68,0.05)',
              }}
            >
              {step.icon && (
                <FontAwesomeIcon
                  icon={step.icon}
                  className="relative z-10"
                  style={{ fontSize: 11, opacity: active ? 1 : 0.7 }}
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10">{step.label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
