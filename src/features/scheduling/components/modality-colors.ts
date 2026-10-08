import type { Application } from '@/features/patient/stores/usePatientStore'

const MODALITY_TONE = {
  subcutaneous: { bg: '#B7E06A', text: '#4E6E23' },
  sublingual: { bg: '#74C3B9', text: '#1E5A52' },
} as const

export function modalityStyle(application: Application) {
  const modality =
    MODALITY_TONE[application.modality === 'sublingual' ? 'sublingual' : 'subcutaneous']
  return {
    surface: `${modality.bg}33`,
    border: `${modality.bg}99`,
    ink: modality.text,
  }
}
