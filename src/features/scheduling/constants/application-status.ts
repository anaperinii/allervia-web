import type { Application } from '@/features/patient/stores/patient-store'

export const APPLICATION_STATUS_DISPLAY: Record<Application['status'], { label: string; className: string }> = {
  scheduled: { label: 'Agendada', className: 'bg-brand/10 text-brand' },
  completed: { label: 'Realizada', className: 'bg-green-100 text-green-700' },
  canceled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
  missed: { label: 'Ausente', className: 'bg-red-100 text-red-600' },
}
