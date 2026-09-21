import type { Page } from '@/shared/api/contracts/team'
import type {
  ProtocolPhase,
  ProtocolStep,
  SimulationResult,
} from '@/shared/api/contracts/protocols'

export type AdministrationRoute = 'SUBCUTANEOUS' | 'SUBLINGUAL'
export type TherapyStatus = 'IN_PROGRESS' | 'SUSPENDED' | 'COMPLETED'
export type DoseStatus =
  | 'SCHEDULED'
  | 'ADMINISTERED_ON_SCHEDULE'
  | 'ADMINISTERED_OFF_SCHEDULE'
  | 'ENTERED_IN_ERROR'

export interface ResponsiblePhysician {
  id: string
  fullName: string
  councilNumber?: string | null
  councilUf?: string | null
}

export interface TherapySummary {
  id: string
  immunoType: string
  administrationRoute: AdministrationRoute
  extract: string
  status: TherapyStatus
  revision: number
  inductionStartDate: string
  maintenanceStartDate: string | null
  prescription: { versionId: string; revision: number } | null
  nextDose: { id: string; scheduledAt: string; status: DoseStatus } | null
  createdAt: string
}

export interface PatientListItem {
  id: string
  fullName: string
  cpfMasked: string | null
  birthDate: string
  phoneNumber: string
  weightInKg: number
  isActive: boolean
  responsiblePhysician: ResponsiblePhysician
  therapyCount: number
  therapyStatuses: TherapyStatus[]
  createdAt: string
}

export interface PatientDetail extends PatientListItem {
  /** Documento completo; presente apenas para quem pode editar o cadastro. */
  cpf?: string | null
  therapies: TherapySummary[]
  updatedAt: string
}

export interface ImmunotherapyListItem {
  id: string
  immunoType: string
  administrationRoute: AdministrationRoute
  extract: string
  status: TherapyStatus
  revision: number
  inductionStartDate: string
  maintenanceStartDate: string | null
  patient: { id: string; fullName: string; isActive: boolean }
  responsiblePhysician: { id: string; fullName: string }
  prescription: { versionId: string; revision: number } | null
  nextDose: { id: string; scheduledAt: string; status: DoseStatus } | null
  createdAt: string
}

export interface ImmunotherapyDetail extends ImmunotherapyListItem {
  isArchived: boolean
  prescription:
    | { versionId: string; revision: number; resolved?: unknown }
    | null
  doseCount: number
  updatedAt: string
}

export type PatientPage = Page<PatientListItem>
export type ImmunotherapyPage = Page<ImmunotherapyListItem>

export type DoseObservationPhase = 'PRE_ADMINISTRATION' | 'POST_ADMINISTRATION'
export type DoseImmediateConduct =
  | 'MAINTAIN'
  | 'REQUEST_PHYSICIAN_REVIEW'
  | 'SUSPEND_TREATMENT'

/** Valores clínicos como o motor os grava: decimais exatos em string. */
export interface DoseValues {
  concentration: string
  volume: string
  intervalDays: number
  phase: ProtocolPhase
  route: AdministrationRoute
  volumeUnit: string
  concentrationUnit: string
}

export interface DoseObservation {
  id: string
  phase: DoseObservationPhase
  reportedSideEffects: string[]
  administeredMedications: string[]
  notes: string | null
  createdAt: string
}

/** Registro persistido de uma dose: previsto e realizado são campos distintos. */
export interface DoseRecord {
  id: string
  immunotherapyId: string
  status: DoseStatus
  scheduledAt: string
  administeredAt: string | null
  administrationEndedAt: string | null
  administeredById: string | null
  performedById: string | null
  immediateConduct: DoseImmediateConduct | null
  immediateConductJustification: string | null
  betweenDosesReport: string
  plannedStepId: string | null
  administeredStepId: string | null
  plannedValues: DoseValues | null
  administeredValues: DoseValues | null
  recommendation: SimulationResult | null
  sourceDoseId: string | null
  revision: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface DoseDetail extends DoseRecord {
  protocolVersionId: string | null
  prescriptionRevision: number | null
  therapyRevision: number
  allowedValues: ProtocolStep[]
  migrationRequired: boolean
  observations?: DoseObservation[]
}

export interface DoseValuesBody {
  concentration: string
  volume: string
  intervalDays: number
  stepId?: string
  phase?: ProtocolPhase
}

export interface DoseRevisionBody {
  expectedRevision: number
  expectedTherapyRevision: number
}

export interface PreviewDoseBody extends DoseRevisionBody {
  values: DoseValuesBody
  administeredAt: string
}

export interface PreviewDoseResult {
  recommendation: SimulationResult
  allowedValues: ProtocolStep[]
  nextScheduledAt: string | null
  expectedRevision: number
  expectedTherapyRevision: number
  prescriptionRevision: number
  protocolVersionId: string
}

export interface UpdateScheduledDoseBody extends DoseRevisionBody {
  values: DoseValuesBody
  scheduledAt: string
  reason: string
}

export interface DoseObservationBody {
  phase: DoseObservationPhase
  reportedSideEffects: string[]
  administeredMedications: string[]
  notes?: string
}

export interface AdministerDoseBody extends PreviewDoseBody {
  idempotencyKey: string
  betweenDosesReport: string
  reason?: string
  observations?: DoseObservationBody[]
  administrationEndedAt?: string
  performedById?: string
  immediateConduct?: { type: DoseImmediateConduct; justification?: string }
}

export interface AdministerDoseResult {
  dose: DoseRecord
  successor: DoseRecord | null
  recommendation: SimulationResult
  therapyRevision: number
}
