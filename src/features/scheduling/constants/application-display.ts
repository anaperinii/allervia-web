import type { Application } from '@/features/patient/stores/usePatientStore'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizada', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}

export function getApplicationEventColor(application: Application) {
  const bg = 'rgba(249,250,251,0.8)'
  const grad = (c: string) => `linear-gradient(105deg, ${c}30 0%, ${c}14 55%, transparent 80%)`
  if (application.status === 'missed') return { bg, text: '#334155', border: '#94A3B8', grad: grad('#94A3B8') }
  if (application.modality === 'sublingual') return { bg, text: '#1F6E75', border: '#3CA6AD', grad: grad('#3CA6AD') }
  return { bg, text: '#234E58', border: '#4d7e85', grad: grad('#4d7e85') }
}
