import type { Application } from '@/features/patient/stores/usePatientStore'
import { useModalityStyle } from '@/features/scheduling/components/modality-colors'
import type { AppointmentStatus } from '@/shared/api/contracts/clinical'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendado', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizado', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}

export function appointmentStatusToApplicationStatus(status: AppointmentStatus): Application['status'] {
  switch (status) {
    case 'MISSED':
      return 'missed'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
      return 'canceled'
    default:
      return 'scheduled'
  }
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
