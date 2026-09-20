import { create } from 'zustand'
import { isMaintenanceDose } from '@/features/immunotherapy/constants/scit-protocol'
import { comparePtDateAsc } from '@/shared/lib/dates'

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
  /** ID real do médico responsável; presente quando veio da API. */
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
}

interface PatientState {
  selectedPatient: Patient | null
  applications: Application[]
  setSelectedPatient: (patient: Patient | null) => void
  addProtocolAdjustment: (adjustment: ProtocolAdjustment) => void
  inactivateImmunotherapy: (inactivation: Inactivation) => void
  reactivateImmunotherapy: (payload: {
    note: string
    reactivatedBy: string
    reactivateConcentration: string
    reactivateInterval: number
    justification: string
  }) => void
  scheduleApplication: (app: Application) => void
  recordEvolution: (payload: { completed: Application; next: Application }) => void
}

export function seedInactivationsFor(): Inactivation[] | undefined {
  // Suspensões reais chegam com o contrato da I9; nenhum seed é recuperado.
  return undefined
}

export function derivePatientDates(applications: Application[], patientId: string): {
  inductionStart: string | null
  maintenanceStart: string | null
} {
  const ofPatient = applications
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => comparePtDateAsc(a.date, b.date))
  const inductionStart = ofPatient[0]?.date ?? null
  const firstMaintenance = ofPatient.find((a) => a.status === 'completed' && isMaintenanceDose(a.dose))
  return { inductionStart, maintenanceStart: firstMaintenance?.date ?? null }
}

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: null,
  // Histórico de aplicações vem da API na I6; sem consulta, a lista fica
  // vazia em vez de exibir dados simulados como prontuário.
  applications: [],
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  scheduleApplication: (app) => set((s) => ({ applications: [...s.applications, app] })),
  recordEvolution: ({ completed, next }) => set((s) => {

    const patientScheduled = s.applications
      .filter((a) => a.patientId === completed.patientId && a.status === 'scheduled')
      .sort((a, b) => comparePtDateAsc(a.date, b.date))
    const nextToReplace = patientScheduled[0]?.id
    const filtered = nextToReplace
      ? s.applications.filter((a) => a.id !== nextToReplace)
      : s.applications
    return {
      applications: [...filtered, completed, next],
      selectedPatient: s.selectedPatient && s.selectedPatient.id === completed.patientId ? {
        ...s.selectedPatient,
        currentDoseConcentration: completed.dose,
        currentInterval: next.cycle.days,
        nextApplicationDate: next.date,
      } : s.selectedPatient,
    }
  }),
  addProtocolAdjustment: (adjustment) => set((s) => {
    if (!s.selectedPatient) return s
    return {
      selectedPatient: {
        ...s.selectedPatient,
        currentDoseConcentration: adjustment.newConcentration,
        currentInterval: adjustment.newInterval,
        protocolAdjustments: [...(s.selectedPatient.protocolAdjustments || []), adjustment],
      },
    }
  }),
  inactivateImmunotherapy: (inactivation) => set((s) => {
    if (!s.selectedPatient) return s
    return {
      selectedPatient: {
        ...s.selectedPatient,
        status: 'inactive',
        inactivations: [...(s.selectedPatient.inactivations || []), inactivation],
      },
    }
  }),
  reactivateImmunotherapy: ({ note, reactivatedBy, reactivateConcentration, reactivateInterval, justification }) => set((s) => {
    if (!s.selectedPatient) return s
    const list = s.selectedPatient.inactivations || []
    if (list.length === 0) return s
    const updated = [...list]
    const lastIdx = updated.length - 1
    const reactivatedAt = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às')
    updated[lastIdx] = {
      ...updated[lastIdx],
      reactivatedAt,
      reactivateNote: note,
      reactivatedBy,
      reactivateConcentration,
      reactivateInterval,
      reactivateJustification: justification,
    }
    return {
      selectedPatient: {
        ...s.selectedPatient,
        status: 'active',
        currentDoseConcentration: reactivateConcentration,
        currentInterval: reactivateInterval,
        inactivations: updated,
      },
    }
  }),
}))
