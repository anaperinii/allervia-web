export interface ConcentrationStage {
  conc: string
  color: string
  active: boolean
}

export const CONCENTRATION_STAGES: readonly ConcentrationStage[] = [
  { conc: '1:10.000', color: '#B6F2EC', active: true },
  { conc: '1:1.000', color: '#2CD3C1', active: true },
  { conc: '1:100', color: '#18C1CB', active: true },
  { conc: '1:10', color: '#0E99A3', active: false },
] as const

export const HERO_PATIENT = {
  initials: 'CF',
  name: 'Caroline Ferreira',
  nextLabel: 'Próxima · Hoje 14h30',
  progressPct: 75,
  nextDose: '1:10 — 0,5ml',
} as const
