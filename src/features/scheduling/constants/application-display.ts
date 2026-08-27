import type { Application } from '@/features/patient/stores/usePatientStore'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizada', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}

export function getApplicationEventColor(application: Application) {
  const grad = 'linear-gradient(105deg, rgba(255,255,255,0.12) 0%, transparent 55%)'
  // Softer tints of the modality colors so the calendar reads calmer.
  if (application.modality === 'sublingual') return { bg: '#A6D9D1', text: '#1E5A52', border: '#74C3B9', grad }
  return { bg: '#CFE99E', text: '#4E6E23', border: '#B7E06A', grad }
}
