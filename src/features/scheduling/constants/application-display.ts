import type { Application } from '@/features/patient/stores/usePatientStore'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizada', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}

export function getApplicationEventColor(application: Application) {
  if (application.status === 'missed') return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' }
  if (application.modality === 'sublingual') return { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6' }
  return { bg: '#CCFBF1', text: '#115E59', border: '#14B8A6' }
}
