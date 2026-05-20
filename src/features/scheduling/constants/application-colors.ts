import type { Application } from '@/features/patient/stores/patient-store'

export function getApplicationEventColor(application: Application) {
  if (application.status === 'missed') return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' }
  if (application.modality === 'sublingual') return { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6' }
  return { bg: '#CCFBF1', text: '#115E59', border: '#14B8A6' }
}
