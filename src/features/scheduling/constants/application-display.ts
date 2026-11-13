import type { Application } from '@/features/patient/stores/usePatientStore'
import { useModalityStyle } from '@/features/scheduling/components/modality-colors'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizada', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}

const EVENT_COLOR_GRAD = 'linear-gradient(105deg, rgba(255,255,255,0.12) 0%, transparent 55%)'

export function useApplicationEventColor(): (application: Application) => {
  bg: string
  text: string
  border: string
  grad: string
} {
  const modalityStyle = useModalityStyle()
  return (application) => {
    const tone = modalityStyle(application)
    return { bg: tone.surface, text: tone.ink, border: tone.border, grad: EVENT_COLOR_GRAD }
  }
}
