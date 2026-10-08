import type { Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { MODALITY_LABELS } from '@/features/immunotherapy/constants/modality'
import type { Patient } from '@/features/patient/stores/usePatientStore'

interface PatientProfile {
  birthDate: string
  age: number
  cpf: string
  weight: string
  extract: string
  targetConcentrationVolume: string
  targetReached: boolean
}

const EMPTY_PROFILE: PatientProfile = {
  birthDate: '',
  age: 0,
  cpf: '',
  weight: '',
  extract: '',
  targetConcentrationVolume: '',
  targetReached: false,
}

const registeredProfiles: Record<string, PatientProfile> = {}

export function registerPatientProfile(id: string, profile: PatientProfile): void {
  registeredProfiles[id] = profile
}

export function buildPatientFromImmunotherapy(imm: Immunotherapy): Patient {
  const profile = registeredProfiles[imm.id] ?? EMPTY_PROFILE
  const status = imm.status === 'active' ? ('active' as const) : ('inactive' as const)

  return {
    id: imm.id,
    name: imm.name,
    birthDate: profile.birthDate,
    age: profile.age,
    phone: imm.phone,
    weight: profile.weight,
    cpf: profile.cpf,
    responsibleDoctor: imm.responsibleDoctor,
    status,
    immunotherapyType: imm.type,
    administrationRoute: MODALITY_LABELS[imm.modality],
    extract: profile.extract,
    targetConcentrationVolume: profile.targetConcentrationVolume,
    targetReached: profile.targetReached,
    currentInterval: imm.cycleInterval.days,
    nextApplicationDate: '',
    currentDoseConcentration: imm.doseConcentration,
  }
}
