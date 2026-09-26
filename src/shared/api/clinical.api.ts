import { apiRequest } from '@/shared/api/client'
import type {
  AdministerDoseBody,
  AdministerDoseResult,
  AdministrationRoute,
  Appointment,
  AppointmentPage,
  AppointmentStatus,
  AuditLogEntry,
  ClinicalExportPage,
  ClinicalHistory,
  ClinicalMetrics,
  DoseDetail,
  DoseRecord,
  DoseStatus,
  ImmunotherapyDetail,
  ImmunotherapyPage,
  LateObservationBody,
  DoseObservationAddendum,
  PatientDetail,
  PatientPage,
  PreviewDoseBody,
  PreviewDoseResult,
  RetractDoseBody,
  RetractDoseResult,
  RevisePrescriptionBody,
  RevisePrescriptionResult,
  SchedulePage,
  TherapyLifecycleBody,
  TherapyLifecycleHistory,
  TherapyLifecycleResult,
  TherapyStatus,
  TherapySummary,
  UpdateScheduledDoseBody,
} from '@/shared/api/contracts/clinical'

function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export interface PatientsQuery {
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
  responsiblePhysicianId?: string
}

export function listPatients(
  query: PatientsQuery,
  signal?: AbortSignal,
): Promise<PatientPage> {
  return apiRequest(`/patients${toQueryString({ ...query })}`, { signal })
}

export function getPatient(
  patientId: string,
  signal?: AbortSignal,
): Promise<PatientDetail> {
  return apiRequest(`/patients/${patientId}`, { signal })
}

export interface UpdatePatientBody {
  fullName?: string
  phoneNumber?: string
  weightInKg?: number
  birthDate?: string
  cpf?: string
  responsiblePhysicianId?: string
}

export function updatePatient(
  patientId: string,
  body: UpdatePatientBody,
): Promise<unknown> {
  return apiRequest(`/patients/update/${patientId}`, { method: 'PATCH', body })
}

export interface ImmunotherapiesQuery {
  page?: number
  pageSize?: number
  search?: string
  status?: TherapyStatus
  route?: AdministrationRoute
  responsiblePhysicianId?: string
  includeArchived?: boolean
}

export function listImmunotherapies(
  query: ImmunotherapiesQuery,
  signal?: AbortSignal,
): Promise<ImmunotherapyPage> {
  return apiRequest(`/immunotherapies/list${toQueryString({ ...query })}`, {
    signal,
  })
}

export function getImmunotherapy(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<ImmunotherapyDetail> {
  return apiRequest(`/immunotherapies/${immunotherapyId}`, { signal })
}

export function listTherapiesForPatient(
  patientId: string,
  signal?: AbortSignal,
): Promise<TherapySummary[]> {
  return apiRequest(`/immunotherapies/patients/${patientId}`, { signal })
}

export interface RegisterImmunotherapyBody {
  idempotencyKey: string
  patient?: {
    fullName: string
    birthDate: string
    weightInKg: number
    phoneNumber: string
    cpf?: string
    responsiblePhysicianId: string
  }
  patientId?: string
  immunoType: string
  administrationRoute: 'SUBCUTANEOUS'
  extract: string
  inductionStartDate: string
  protocolVersionId: string
  stepIds: string[]
  startingStepId: string
  targetStepId: string
}

export interface RegisterImmunotherapyResult {
  patient: { id: string; fullName: string }
  immunotherapy: { id: string; patientId: string }
  firstDose: { id: string; scheduledAt: string }
}

export function registerImmunotherapy(
  body: RegisterImmunotherapyBody,
): Promise<RegisterImmunotherapyResult> {
  return apiRequest('/immunotherapies/register', { method: 'POST', body })
}

export function executeTherapyLifecycle(
  immunotherapyId: string,
  body: TherapyLifecycleBody,
): Promise<TherapyLifecycleResult> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/lifecycle`, {
    method: 'POST',
    body,
  })
}

export function getTherapyLifecycle(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<TherapyLifecycleHistory> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/lifecycle`, { signal })
}

export function revisePrescription(
  immunotherapyId: string,
  body: RevisePrescriptionBody,
): Promise<RevisePrescriptionResult> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/prescription/revision`, {
    method: 'POST',
    body,
  })
}

export function retractDose(
  doseId: string,
  body: RetractDoseBody,
): Promise<RetractDoseResult> {
  return apiRequest(`/doses/${doseId}/retract`, { method: 'POST', body })
}

export function addLateObservation(
  doseId: string,
  body: LateObservationBody,
): Promise<{ addendum: DoseObservationAddendum; suspensionEventId: string | null }> {
  return apiRequest(`/doses/${doseId}/observations`, { method: 'POST', body })
}

export interface ClinicalExportQuery {
  asOf: string
  status?: TherapyStatus
  responsiblePhysicianId?: string
  page?: number
  pageSize?: number
}

export function exportClinicalDoses(
  query: ClinicalExportQuery,
  signal?: AbortSignal,
): Promise<ClinicalExportPage> {
  return apiRequest(`/immunotherapies/export${toQueryString({ ...query })}`, {
    signal,
  })
}

export function getClinicalHistory(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<ClinicalHistory> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/history`, { signal })
}

export function listAuditLogs(
  query: { limit?: number; cursor?: string; entityType?: string; action?: string },
  signal?: AbortSignal,
): Promise<AuditLogEntry[]> {
  return apiRequest(`/audit-logs${toQueryString({ ...query })}`, { signal })
}

export interface AppointmentsQuery {
  from: string
  to: string
  status?: AppointmentStatus
  patientId?: string
  page?: number
  pageSize?: number
}

export function listAppointments(
  query: AppointmentsQuery,
  signal?: AbortSignal,
): Promise<AppointmentPage> {
  return apiRequest(`/appointments${toQueryString({ ...query })}`, { signal })
}

export function createAppointment(body: {
  patientId: string
  doseId?: string
  title?: string
  startsAt: string
  endsAt: string
  notes?: string
}): Promise<Appointment> {
  return apiRequest('/appointments', { method: 'POST', body })
}

export function updateAppointment(
  appointmentId: string,
  body: {
    expectedRevision: number
    status?: AppointmentStatus
    statusReason?: string
    startsAt?: string
    endsAt?: string
    title?: string
    notes?: string
  },
): Promise<Appointment> {
  return apiRequest(`/appointments/${appointmentId}`, { method: 'PATCH', body })
}

export interface ScheduleQuery {
  from: string
  to: string
  status?: DoseStatus
  search?: string
  responsiblePhysicianId?: string
  page?: number
  pageSize?: number
}

export function listDoseSchedule(
  query: ScheduleQuery,
  signal?: AbortSignal,
): Promise<SchedulePage> {
  return apiRequest(`/doses${toQueryString({ ...query })}`, { signal })
}

export function getClinicalMetrics(
  query: { from: string; to: string },
  signal?: AbortSignal,
): Promise<ClinicalMetrics> {
  return apiRequest(`/doses/metrics${toQueryString({ ...query })}`, { signal })
}

export function listDosesForTherapy(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<DoseRecord[]> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/doses`, { signal })
}

export function getDose(
  doseId: string,
  signal?: AbortSignal,
): Promise<DoseDetail> {
  return apiRequest(`/doses/${doseId}`, { signal })
}

export function previewDose(
  doseId: string,
  body: PreviewDoseBody,
  signal?: AbortSignal,
): Promise<PreviewDoseResult> {
  return apiRequest(`/doses/${doseId}/preview`, {
    method: 'POST',
    body,
    signal,
  })
}

export function updateScheduledDose(
  doseId: string,
  body: UpdateScheduledDoseBody,
): Promise<DoseRecord & { therapyRevision: number }> {
  return apiRequest(`/doses/${doseId}/scheduled`, { method: 'PATCH', body })
}

export function administerDose(
  doseId: string,
  body: AdministerDoseBody,
): Promise<AdministerDoseResult> {
  return apiRequest(`/doses/${doseId}/administer`, { method: 'POST', body })
}
