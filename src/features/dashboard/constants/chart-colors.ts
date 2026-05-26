export const CONCENTRATION_COLORS: Record<string, string> = {
  '1:10.000': '#B6F2EC',
  '1:1.000': '#2CD3C1',
  '1:100': '#18C1CB',
  '1:10': '#0E99A3',
}

export const PHASE_KEYS = ['induction', 'maintenance'] as const
export type PhaseKey = (typeof PHASE_KEYS)[number]

export const PHASE_LABELS: Record<PhaseKey, string> = {
  induction: 'Indução',
  maintenance: 'Manutenção',
}

export const PHASE_COLORS: Record<PhaseKey, string> = {
  induction: '#18C1CB',
  maintenance: '#A78BFA',
}

export const TREATMENT_STATUS_KEYS = ['active', 'interrupted', 'completed'] as const
export type TreatmentStatusKey = (typeof TREATMENT_STATUS_KEYS)[number]

export const TREATMENT_STATUS_LABELS: Record<TreatmentStatusKey, string> = {
  active: 'Ativas',
  interrupted: 'Interrompidas',
  completed: 'Concluídas',
}

export const TREATMENT_STATUS_COLORS: Record<TreatmentStatusKey, string> = {
  active: '#2CD3C1',
  interrupted: '#F4845F',
  completed: '#22DD44',
}

export const SEQUENTIAL_TYPE_COLORS = ['#0E99A3', '#18C1CB', '#2CD3C1', '#B6F2EC', '#3F98AF']

export const VOLUME_KEYS = ['0,1ml', '0,2ml', '0,4ml', '0,5ml', '0,8ml'] as const
export type VolumeKey = (typeof VOLUME_KEYS)[number]

export const VOLUME_COLORS: Record<VolumeKey, string> = {
  '0,1ml': '#B6F2EC',
  '0,2ml': '#2CD3C1',
  '0,4ml': '#18C1CB',
  '0,5ml': '#A78BFA',
  '0,8ml': '#0E99A3',
}

export const DEFAULT_IMMUNOTHERAPY_TYPES = ['Gramíneas', 'Ácaros', 'Cão e Gato', 'Cândida', 'Herpes']
