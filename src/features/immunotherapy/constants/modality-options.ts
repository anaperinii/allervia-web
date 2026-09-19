import type { ModalityTab } from '../components/ImmunotherapiesFilterBar';

export const MODALITY_OPTIONS: { value: ModalityTab; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'subcutaneous', label: 'Subcutânea' },
  { value: 'sublingual', label: 'Sublingual' },
]
