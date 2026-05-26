import type { Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'

export type Modality = Immunotherapy['modality']

export const MODALITY_LABELS: Record<Modality, string> = {
  subcutaneous: 'Subcutânea',
  sublingual: 'Sublingual',
}

export const MODALITY_OPTIONS: { value: Modality; label: string }[] = (
  Object.entries(MODALITY_LABELS) as [Modality, string][]
).map(([value, label]) => ({ value, label }))
