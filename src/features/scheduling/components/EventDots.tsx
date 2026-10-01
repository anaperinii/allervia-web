import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import type { Application } from '@/features/patient/stores/usePatientStore'

const MODALITY_DOT = {
  subcutaneous: { bg: '#B7E06A', text: '#4E6E23', label: 'SCIT', title: 'SCIT · Subcutânea' },
  sublingual: { bg: '#74C3B9', text: '#1E5A52', label: 'SLIT', title: 'SLIT · Sublingual' },
} as const

interface EventDotsProps {
  application: Application
  size?: 'sm' | 'md'
}

/**
 * As duas bolinhas do evento: o intervalo (cor própria, número de dias dentro)
 * e a sigla da modalidade do protocolo (SCIT/SLIT).
 */
export function EventDots({ application, size = 'md' }: EventDotsProps) {
  const interval = getIntervalColor(application.cycle.days)
  const modality =
    MODALITY_DOT[application.modality === 'sublingual' ? 'sublingual' : 'subcutaneous']
  const circle =
    size === 'md'
      ? 'flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[0.52rem] font-bold leading-none shrink-0'
      : 'flex h-[14px] min-w-[14px] items-center justify-center rounded-full px-0.5 text-[0.44rem] font-bold leading-none shrink-0'
  const pill =
    size === 'md'
      ? 'flex h-[18px] items-center justify-center rounded-full px-1.5 text-[0.5rem] font-bold leading-none shrink-0'
      : 'flex h-[14px] items-center justify-center rounded-full px-1 text-[0.42rem] font-bold leading-none shrink-0'

  return (
    <span className="flex items-center gap-1 shrink-0" aria-hidden="true">
      <span
        className={circle}
        title={`Intervalo de ${application.cycle.days} dias`}
        style={{ background: interval.bg, color: interval.text }}
      >
        {application.cycle.days}
      </span>
      <span
        className={pill}
        title={modality.title}
        style={{ background: modality.bg, color: modality.text }}
      >
        {modality.label}
      </span>
    </span>
  )
}
