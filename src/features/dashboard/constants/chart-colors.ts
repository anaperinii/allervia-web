import { INTERVAL_COLORS } from '@/features/immunotherapy/constants/interval-colors'

// concentration ratios reuse the interval tag colors, respectively (7 / 14 / 21 / 28 days)
export const CONCENTRATION_COLORS: Record<string, string> = {
  '1:10.000': INTERVAL_COLORS[7].bg,
  '1:1.000': INTERVAL_COLORS[14].bg,
  '1:100': INTERVAL_COLORS[21].bg,
  '1:10': INTERVAL_COLORS[28].bg,
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

// Volume is encoded as tonal intensity of each concentration's own donut color:
// light tint for the smallest volume, progressively stronger toward the largest.
// Explicit hex ramps per concentration (0,1ml lightest -> 0,8ml strongest).
export const CONCENTRATION_VOLUME_COLORS: Record<string, Record<VolumeKey, string>> = {
  '1:10.000': { '0,1ml': '#CDB4EC', '0,2ml': '#B98FE0', '0,4ml': '#A776D5', '0,5ml': '#9059C7', '0,8ml': '#6E3EB0' },
  '1:1.000': { '0,1ml': '#EEB4B9', '0,2ml': '#E59199', '0,4ml': '#D9707A', '0,5ml': '#C74E5A', '0,8ml': '#A6353F' },
  '1:100': { '0,1ml': '#D3EBB0', '0,2ml': '#BADF89', '0,4ml': '#A0CE68', '0,5ml': '#84B546', '0,8ml': '#63912F' },
  '1:10': { '0,1ml': '#B7EAE7', '0,2ml': '#93DEDA', '0,4ml': '#6BCCC7', '0,5ml': '#45ACA7', '0,8ml': '#278A86' },
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
