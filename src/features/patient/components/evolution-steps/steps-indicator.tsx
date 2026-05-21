import { cn } from '@/shared/lib/utils'

const STEP_LABELS = ['Paciente', 'Pré-Aplicação', 'Pós-Aplicação', 'Revisão dos Dados']

interface StepsIndicatorProps {
  current: number
}

export function StepsIndicator({ current }: StepsIndicatorProps) {
  return (
    <ol className="px-5 py-7 flex items-center justify-center gap-4 list-none m-0" aria-label="Etapas da evolução">
      {STEP_LABELS.map((label, i) => {
        const active = current === i
        const done = current > i
        return (
          <li key={label} className="flex items-center gap-4">
            <div className="flex items-center gap-2.5" aria-current={active ? 'step' : undefined}>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all',
                  active
                    ? 'bg-linear-to-br from-brand to-teal-400 text-white'
                    : done
                    ? 'bg-teal-100 text-teal-600 opacity-50'
                    : 'bg-gray-200 text-gray-500',
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'text-[0.8rem] font-medium',
                  active ? 'text-teal-600' : done ? 'text-teal-600 opacity-50' : 'text-gray-400',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  'h-px w-14 border-t-[1.5px]',
                  done ? 'border-teal-400 border-solid' : 'border-gray-200 border-dashed',
                )}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
