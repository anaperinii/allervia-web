import type { Immunotherapy } from '@/features/immunotherapy/stores/immunotherapies-store'
import type { Patient } from '@/features/patient/stores/patient-store'
import { seedInactivationsFor } from '@/features/patient/stores/patient-store'

interface PatientProfile {
  birthDate: string
  age: number
  cpf: string
  weight: string
  extract: string
  inductionStart: string
  maintenanceStart: string | null
  targetConcentrationVolume: string
  targetReached: boolean
}

const EXTRACT_BY_TYPE: Record<string, string> = {
  'Ácaros': 'Der p 60% + Der f 30% + Blt 10%',
  'Gramíneas': 'Lolium 50% + Phleum 30% + Holcus 20%',
  'Cão e Gato': 'Can f 1 60% + Fel d 1 40%',
  'Cândida': 'Candida albicans 100%',
  'Herpes': 'HSV-1 80% + HSV-2 20%',
  'Fungos': 'Alternaria 50% + Aspergillus 30% + Cladosporium 20%',
  'Insetos': 'Apis mellifera 70% + Vespula 30%',
}

const TARGET_BY_MODALITY: Record<Immunotherapy['modality'], string> = {
  subcutaneous: '1:10 - 0,5ml',
  sublingual: '1:10 - 0,3ml',
}

const PATIENT_PROFILES: Record<string, PatientProfile> = {
  '1': { birthDate: '15/04/2007', age: 18, cpf: '124.583.706-42', weight: '52.3 kg', extract: '', inductionStart: '04/03/2026', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
  '2': { birthDate: '22/11/1992', age: 33, cpf: '587.291.034-18', weight: '64.0 kg', extract: '', inductionStart: '23/12/2025', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
  '3': { birthDate: '08/07/2015', age: 10, cpf: '091.847.563-25', weight: '32.5 kg', extract: '', inductionStart: '12/02/2026', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
  '4': { birthDate: '30/01/1998', age: 28, cpf: '304.715.689-50', weight: '58.7 kg', extract: '', inductionStart: '18/02/2026', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
  '5': { birthDate: '12/09/1985', age: 40, cpf: '762.408.193-77', weight: '78.2 kg', extract: '', inductionStart: '20/01/2024', maintenanceStart: '15/05/2024', targetConcentrationVolume: '', targetReached: true },
  '6': { birthDate: '03/03/1990', age: 36, cpf: '489.230.671-04', weight: '61.4 kg', extract: '', inductionStart: '01/03/2024', maintenanceStart: '20/06/2024', targetConcentrationVolume: '', targetReached: true },
  '7': { birthDate: '25/06/1972', age: 53, cpf: '138.594.726-91', weight: '69.0 kg', extract: '', inductionStart: '14/06/2023', maintenanceStart: '02/10/2023', targetConcentrationVolume: '', targetReached: true },
  '8': { birthDate: '14/10/1988', age: 37, cpf: '851.327.460-66', weight: '81.5 kg', extract: '', inductionStart: '12/02/2026', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
  '9': { birthDate: '18/02/2010', age: 16, cpf: '290.418.357-13', weight: '47.8 kg', extract: '', inductionStart: '08/01/2026', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
  '10': { birthDate: '27/05/1995', age: 30, cpf: '643.715.802-39', weight: '72.6 kg', extract: '', inductionStart: '10/12/2023', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
  '11': { birthDate: '09/12/1989', age: 36, cpf: '405.286.913-58', weight: '65.9 kg', extract: '', inductionStart: '22/09/2023', maintenanceStart: '15/01/2024', targetConcentrationVolume: '', targetReached: true },
  '12': { birthDate: '05/08/1968', age: 57, cpf: '917.052.864-21', weight: '89.3 kg', extract: '', inductionStart: '14/11/2025', maintenanceStart: null, targetConcentrationVolume: '', targetReached: false },
}

const ADMINISTRATION_ROUTE_BY_MODALITY: Record<Immunotherapy['modality'], string> = {
  subcutaneous: 'Subcutânea',
  sublingual: 'Sublingual',
}

const FALLBACK_PROFILE: PatientProfile = {
  birthDate: '01/01/2000',
  age: 25,
  cpf: '000.000.000-00',
  weight: '70 kg',
  extract: '',
  inductionStart: '01/01/2024',
  maintenanceStart: null,
  targetConcentrationVolume: '',
  targetReached: false,
}

export function buildPatientFromImmunotherapy(imm: Immunotherapy): Patient {
  const profile = PATIENT_PROFILES[imm.id] ?? FALLBACK_PROFILE
  const extract = profile.extract || EXTRACT_BY_TYPE[imm.type] || 'Extrato padrão'
  const target = profile.targetConcentrationVolume || TARGET_BY_MODALITY[imm.modality]
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
    inductionStart: profile.inductionStart,
    maintenanceStart: profile.maintenanceStart,
    administrationRoute: ADMINISTRATION_ROUTE_BY_MODALITY[imm.modality],
    extract,
    targetConcentrationVolume: target,
    targetReached: profile.targetReached,
    currentInterval: imm.cycleInterval.days,
    nextApplicationDate: '',
    currentDoseConcentration: imm.doseConcentration,
    inactivations: status === 'inactive'
      ? seedInactivationsFor(imm.id, imm.doseConcentration, imm.cycleInterval.days)
      : undefined,
  }
}
