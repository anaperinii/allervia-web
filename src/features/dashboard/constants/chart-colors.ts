export const CONCENTRATION_COLORS: Record<string, string> = {
  '1:10.000': '#B9D4D7',
  '1:1.000': '#9BC1C4',
  '1:100': '#6C9EA5',
  '1:10': '#4d7e85',
}

export const PHASE_KEYS = ['induction', 'maintenance'] as const
export type PhaseKey = (typeof PHASE_KEYS)[number]

export const PHASE_LABELS: Record<PhaseKey, string> = {
  induction: 'Indução',
  maintenance: 'Manutenção',
}

export const PHASE_COLORS: Record<PhaseKey, string> = {
  induction: '#84C7BB',
  maintenance: '#0D9488',
}

export const TREATMENT_STATUS_KEYS = ['active', 'interrupted', 'completed'] as const
export type TreatmentStatusKey = (typeof TREATMENT_STATUS_KEYS)[number]

export const TREATMENT_STATUS_LABELS: Record<TreatmentStatusKey, string> = {
  active: 'Ativas',
  interrupted: 'Interrompidas',
  completed: 'Concluídas',
}

export const TREATMENT_STATUS_COLORS: Record<TreatmentStatusKey, string> = {
  active: '#14B8A6',
  interrupted: '#0891B2',
  completed: '#0F766E',
}

export const SEQUENTIAL_TYPE_COLORS = ['#4d7e85', '#6C9EA5', '#9BC1C4', '#B9D4D7', '#234E58']

export const VOLUME_KEYS = ['0,1ml', '0,2ml', '0,4ml', '0,5ml', '0,8ml'] as const
export type VolumeKey = (typeof VOLUME_KEYS)[number]

export const VOLUME_COLORS: Record<VolumeKey, string> = {
  '0,1ml': '#C9DEDF',
  '0,2ml': '#9BC1C4',
  '0,4ml': '#6C9EA5',
  '0,5ml': '#4d7e85',
  '0,8ml': '#234E58',
}

export const DEFAULT_IMMUNOTHERAPY_TYPES = ['Gramíneas', 'Ácaros', 'Cão e Gato', 'Cândida', 'Herpes']
