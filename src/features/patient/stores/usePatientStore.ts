import { create } from 'zustand'

export type ProtocolAdjustmentType =
  | 'dose_reduction'
  | 'interval_increase'
  | 'concentration_change'
  | 'suspension'
  | 'other'

export type InactivationCategory =
  | 'treatment_completion'
  | 'mild_adverse_reaction'
  | 'severe_adverse_reaction'
  | 'acute_infection'
  | 'pregnancy'
  | 'scheduled_surgery'
  | 'recent_vaccination'
  | 'clinical_contraindication'
  | 'protocol_change'
  | 'lack_of_adherence'
  | 'patient_request'
  | 'other'

export interface Inactivation {
  id: string
  category: InactivationCategory
  detail: string
  startDate: string
  expectedReturnDate: string | null
  responsibleDoctor: string
  snapshotConcentration: string
  snapshotInterval: number
  reactivatedAt?: string
  reactivateNote?: string
  reactivatedBy?: string
  reactivateConcentration?: string
  reactivateInterval?: number
  reactivateJustification?: string
}

export interface ProtocolAdjustment {
  id: string
  date: string
  type: ProtocolAdjustmentType
  previousConcentration: string
  previousInterval: number
  newConcentration: string
  newInterval: number
  justification: string
  responsibleDoctor: string
}

export interface Patient {
  id: string
  name: string
  birthDate: string
  age: number
  phone: string
  weight: string
  cpf: string
  responsibleDoctor: string
  responsibleDoctorId?: string
  status: 'active' | 'inactive'
  immunotherapyType: string
  administrationRoute: string
  extract: string
  targetConcentrationVolume: string
  targetReached: boolean
  currentInterval: number
  nextApplicationDate: string
  currentDoseConcentration: string
  protocolAdjustments?: ProtocolAdjustment[]
  inactivations?: Inactivation[]
}

export interface Application {
  id: string
  patientId: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'completed' | 'canceled' | 'missed'
  dose: string
  cycle: { number: number; days: number }
  month: string
  year: number
  appliedVolume?: string
  extractConcentration?: string
  sideEffect?: string
  reportedEffects?: string
  medicationNeeded?: string
  medications?: string
  administrator?: string
  administratorNote?: string
  modality?: 'subcutaneous' | 'sublingual'
  patientName?: string
  patientPhone?: string
}

interface PatientState {
  selectedPatient: Patient | null
  applications: Application[]
  setSelectedPatient: (patient: Patient | null) => void
}

export function derivePatientDates(
  applications: Application[],
  patientId: string,
): { inductionStart: string | null; maintenanceStart: string | null } {
  const ofPatient = applications.filter((a) => a.patientId === patientId)
  return { inductionStart: ofPatient[0]?.date ?? null, maintenanceStart: null }
}

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: null,
  applications: [],
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}))
