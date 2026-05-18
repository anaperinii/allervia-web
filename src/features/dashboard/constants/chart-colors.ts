export const CONC_COLORS: Record<string, string> = {
  '1:10.000': '#B6F2EC',
  '1:1.000': '#2CD3C1',
  '1:100': '#18C1CB',
  '1:10': '#0E99A3',
}

export const PHASE_COLORS = {
  'Indução': '#18C1CB',
  'Manutenção': '#A78BFA',
} as const

export const STATUS_COLORS = {
  'Ativas': '#2CD3C1',
  'Interrompidas': '#F4845F',
  'Concluídas': '#22DD44',
} as const

export const TYPE_COLORS = ['#0E99A3', '#18C1CB', '#2CD3C1', '#B6F2EC', '#3F98AF']

export const VOL_LEGEND = [
  { label: '0,1ml', color: '#B6F2EC' },
  { label: '0,2ml', color: '#2CD3C1' },
  { label: '0,4ml', color: '#18C1CB' },
  { label: '0,8ml', color: '#0E99A3' },
  { label: '0,5ml', color: '#A78BFA' },
]

export const VOLUME_KEYS = ['0,1ml', '0,2ml', '0,4ml', '0,5ml', '0,8ml'] as const

export const ALL_TYPES = ['Gramíneas', 'Ácaros', 'Cão e Gato', 'Cândida', 'Herpes']
