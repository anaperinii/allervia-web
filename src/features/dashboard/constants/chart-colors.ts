export const CONCENTRATION_COLORS: Record<string, string> = {
  '1:10.000': '#B7E06A',
  '1:1.000': '#8FD285',
  '1:100': '#74C3B9',
  '1:10': '#3E8E86',
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

export const SEQUENTIAL_TYPE_COLORS = ['#CBE7EC', '#A2D5DE', '#78BFCC', '#4FA3B4', '#2D7F91']

export const VOLUME_KEYS = ['0,1ml', '0,2ml', '0,4ml', '0,5ml', '0,8ml'] as const
export type VolumeKey = (typeof VOLUME_KEYS)[number]

// Volume is encoded as tonal intensity of each concentration's own donut color:
// light tint for the smallest volume, progressively stronger toward the largest.
// Explicit hex ramps per concentration (0,1ml lightest -> 0,8ml strongest).
export const CONCENTRATION_VOLUME_COLORS: Record<string, Record<VolumeKey, string>> = {
  '1:10.000': { '0,1ml': '#E2F2C4', '0,2ml': '#CFE99E', '0,4ml': '#B7E06A', '0,5ml': '#9BC94D', '0,8ml': '#7BA634' },
  '1:1.000': { '0,1ml': '#D5EDD0', '0,2ml': '#BCE3B4', '0,4ml': '#8FD285', '0,5ml': '#6FB865', '0,8ml': '#52944A' },
  '1:100': { '0,1ml': '#CCE9E4', '0,2ml': '#A6D9D1', '0,4ml': '#74C3B9', '0,5ml': '#4FA99E', '0,8ml': '#37877D' },
  '1:10': { '0,1ml': '#B5D6D2', '0,2ml': '#8CBEB8', '0,4ml': '#64A69F', '0,5ml': '#3E8E86', '0,8ml': '#2A6B65' },
}

// neutral ramp for the volume-intensity legend (hue-independent)
export const VOLUME_LEGEND_COLORS: Record<VolumeKey, string> = {
  '0,1ml': '#DBE3E6',
  '0,2ml': '#B4C4C9',
  '0,4ml': '#8AA1A8',
  '0,5ml': '#5E787F',
  '0,8ml': '#3A5157',
}

export const DEFAULT_IMMUNOTHERAPY_TYPES = ['Gramíneas', 'Ácaros', 'Cão e Gato', 'Cândida', 'Herpes']
