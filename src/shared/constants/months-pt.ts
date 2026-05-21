export const MONTHS_PT_UPPER = [
  'JANEIRO',
  'FEVEREIRO',
  'MARÇO',
  'ABRIL',
  'MAIO',
  'JUNHO',
  'JULHO',
  'AGOSTO',
  'SETEMBRO',
  'OUTUBRO',
  'NOVEMBRO',
  'DEZEMBRO',
] as const

export type MonthPtUpper = (typeof MONTHS_PT_UPPER)[number]

export function monthIndexFromPtUpper(label: string): number {
  return MONTHS_PT_UPPER.indexOf(label.toUpperCase() as MonthPtUpper)
}
