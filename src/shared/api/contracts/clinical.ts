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

export interface DoseRecord {
  id: string
  immunotherapyId: string
  status: DoseStatus
  scheduledAt: string
  administeredAt: string | null
  administrationEndedAt: string | null
  administeredById: string | null
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
  administeredById?: string
  immediateConduct?: { type: DoseImmediateConduct; justification?: string }
}

export interface AdministerDoseResult {
  dose: DoseRecord
  successor: DoseRecord | null
  recommendation: SimulationResult
  therapyRevision: number
}

export interface ClinicalExportRow {
  doseId: string
  status: DoseStatus
  scheduledAt: string
  administeredAt: string | null
  administrationEndedAt: string | null
  planned: DoseValues | null
  administered: DoseValues | null
  immediateConduct: DoseImmediateConduct | null
  administeredBy: { id: string; fullName: string | null } | null
  prescription: {
    versionId: string
    protocolName: string
    versionNumber: number
    timeZone: string | null
  } | null
  therapy: {
    id: string
    immunoType: string
    extract: string
    status: TherapyStatus
    administrationRoute: AdministrationRoute
    inductionStartDate: string
  }
  patient: {
    id: string
    fullName: string
    isActive: boolean
    responsiblePhysician: { id: string; fullName: string }
  }
}

export interface ClinicalExportPage extends Page<ClinicalExportRow> {
  asOf: string
}

export interface ClinicalHistoryEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  timestamp: string
  user: {
    id: string
    professional: { id: string; fullName: string } | null
  }
}

export interface ClinicalHistory {
  therapyId: string
  entries: ClinicalHistoryEntry[]
}

export interface AuditLogEntry {
  id: string
  userId: string
  entityType: string
  entityId: string
  action: string
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  changedFields: string[]
  timestamp: string
}

export type LifecycleEventType = 'SUSPENSION' | 'RESUMPTION' | 'COMPLETION'
export type LifecycleAction = 'SUSPEND' | 'RESUME' | 'COMPLETE'

export interface LifecycleRecommendations {
  retesting?: boolean
  rescueMedication?: boolean
  environmentalControl?: boolean
  custom?: string[]
  monitoringSchedule?: string
  warningSigns?: string
  note?: string
}

export interface TherapyLifecycleBody {
  action: LifecycleAction
  expectedRevision: number
  reason: string
  category?: string
  expectedReturnAt?: string
  recommendations?: LifecycleRecommendations
}

export interface TherapyLifecycleEvent {
  id: string
  type: LifecycleEventType
  category: string | null
  reason: string
  expectedReturnAt: string | null
  recommendations: LifecycleRecommendations | null
  archivedDoseIds: string[]
  createdAt: string
  createdBy: {
    id: string
    professional: { id: string; fullName: string } | null
  }
}

export interface TherapyLifecycleHistory {
  therapy: { id: string; status: TherapyStatus; revision: number }
  events: TherapyLifecycleEvent[]
}

export interface TherapyLifecycleResult {
  event: { id: string; type: LifecycleEventType }
  status: TherapyStatus
  revision: number
  archivedDoseIds: string[]
}

export interface RevisePrescriptionBody {
  targetVersionId: string
  prescription: {
    protocolId: string
    protocolVersionId: string
    route: 'SUBCUTANEOUS'
    stepIds: string[]
    startingStepId: string
    targetStepId: string
  }
  pendingStepId: string
  reason: string
  expectedRevision: number
  dryRun?: boolean
}

export type RevisePrescriptionResult =
  | {
      dryRun: true
      therapyId: string
      pendingDoseId: string
      previousVersionId: string
      targetVersionId: string
      pendingStep: {
        id: string
        label: string
        concentration: string
        volume: string
        intervalDays: number
      }
      scheduledAtUnchanged: string
      historicalDosesUnchanged: true
    }
  | {
      dryRun: false
      prescriptionId: string
      previousPrescriptionId: string
      pendingDose: DoseRecord
      therapyRevision: number
    }

export interface RetractDoseBody {
  reason: string
  expectedRevision: number
  expectedTherapyRevision: number
}

export interface RetractDoseResult {
  dose: DoseRecord
  archivedSuccessorId: string | null
  reissuedDose: DoseRecord
  therapyRevision: number
}

export interface LateObservationBody {
  reportedSideEffects: string[]
  administeredMedications: string[]
  notes?: string
  observedAt: string
  conduct?: { type: DoseImmediateConduct; justification?: string }
  expectedTherapyRevision: number
}

export interface DoseObservationAddendum {
  id: string
  reportedSideEffects: string[]
  administeredMedications: string[]
  notes: string | null
  observedAt: string
  conduct: DoseImmediateConduct | null
  conductJustification: string | null
  createdAt: string
}

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'MISSED'

export interface Appointment {
  id: string
  organizationId: string
  patientId: string
  doseId: string | null
  title: string | null
  startsAt: string
  endsAt: string
  status: AppointmentStatus
  notes: string | null
  statusReason: string | null
  revision: number
  createdAt: string
  updatedAt: string
  patient: { id: string; fullName: string; phoneNumber: string }
  dose: { id: string; scheduledAt: string; status: DoseStatus } | null
}

export type AppointmentPage = Page<Appointment>

export interface ScheduleDoseItem {
  id: string
  immunotherapyId: string
  status: DoseStatus
  scheduledAt: string
  administeredAt: string | null
  administrationEndedAt: string | null
  plannedStepId: string | null
  administeredStepId: string | null
  plannedValues: DoseValues | null
  administeredValues: DoseValues | null
  revision: number
  immunotherapy: {
    id: string
    immunoType: string
    extract: string
    status: TherapyStatus
    revision: number
    patient: {
      id: string
      fullName: string
      phoneNumber: string
      isActive: boolean
      responsiblePhysician: { id: string; fullName: string }
    }
  }
}

export type SchedulePage = Page<ScheduleDoseItem>

export interface ClinicalMetrics {
  from: string
  to: string
  timeZone: string
  applications: {
    total: number
    onSchedule: number
    offSchedule: number
    byDay: { day: string; count: number }[]
  }
  scheduled: { pending: number; overdue: number }
  adherence: {
    numerator: number
    denominator: number
    ratio: number | null
  }
  therapies: {
    inProgress: number
    suspended: number
    completed: number
    buildUp: number
    maintenance: number
  }
}
