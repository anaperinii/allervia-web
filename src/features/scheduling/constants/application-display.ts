import type { Application } from '@/features/patient/stores/usePatientStore'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizada', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}

export function getApplicationEventColor(application: Application) {
  const grad = 'linear-gradient(105deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 45%, transparent 75%)'
  if (application.status === 'missed') return { bg: '#E2E5E9', text: '#5B6470', border: '#E2E5E9', grad }
  if (application.modality === 'sublingual') return { bg: '#A5D4CE', text: '#2E6A61', border: '#A5D4CE', grad }
  return { bg: '#DEF3B2', text: '#5F7E30', border: '#DEF3B2', grad }
}
