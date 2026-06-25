import type { Application } from '@/features/patient/stores/usePatientStore'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizada', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}

export function getApplicationEventColor(application: Application) {
  if (application.status === 'missed') return { bg: '#F1F5F9', text: '#475569', border: '#94A3B8' }
  if (application.modality === 'sublingual') return { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6' }
  return { bg: '#FFEDD5', text: '#9A3412', border: '#FB923C' }
}
