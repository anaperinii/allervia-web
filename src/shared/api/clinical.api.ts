import { z } from 'zod'
import { createContractParser } from '@/shared/api/contracts/contract-parser'
import { parsePatientRecord } from '@/shared/api/contracts/patient-record.schema'
import type { Schema as GeneratedSchema } from '@/shared/api/generated/helpers'
import { parseClinicalMetrics } from '@/shared/api/contracts/clinical-metrics.schema'
import {
  parseAdministerDoseResult,
  parseAppointmentPage,
  parseClinicalExportPage,
  parseDoseDetail,
  parseDoseRecords,
  parseImmunotherapyDetail,
  parseImmunotherapyPage,
  parseImmunotherapyTypes,
  parsePatientDetail,
  parsePatientPage,
  parsePreviewDoseResult,
  parseSchedulePage,
} from '@/shared/api/contracts/clinical-workflow.schema'
import { apiRequest } from '@/shared/api/client'
import type { Schema } from '@/shared/api/generated/helpers'
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

export function getPatientClinicalRecord(patientId: string, signal?: AbortSignal) {
  return apiRequest<unknown>(`/immunotherapies/record/${patientId}`, { signal }).then(parsePatientRecord)
}

export function getStatusHistory(query: { from: string; to: string; timeZone: string; granularity: 'week' | 'month' }, signal?: AbortSignal) {
  return apiRequest<GeneratedSchema<'StatusHistoryResponseDto'>>(`/immunotherapies/status-history${toQueryString(query)}`, { signal }).then(createContractParser<GeneratedSchema<'StatusHistoryResponseDto'>>(z.object({ asOf: z.string().datetime({ offset: true }), timeZone: z.string(), complete: z.literal(true), totalTherapies: z.number().int().nonnegative(), buckets: z.array(z.object({ date: z.string(), label: z.string(), active: z.number().int().nonnegative(), suspended: z.number().int().nonnegative(), completed: z.number().int().nonnegative(), unknown: z.number().int().nonnegative() })) }), 'Série histórica inválida.'))
}

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
  return apiRequest<unknown>(`/patients${toQueryString({ ...query })}`, {
    signal,
  }).then(parsePatientPage)
}

export function getPatient(
  patientId: string,
  signal?: AbortSignal,
): Promise<PatientDetail> {
  return apiRequest<unknown>(`/patients/${patientId}`, { signal }).then(
    parsePatientDetail,
  )
}






export type UpdatePatientBody = Schema<'UpdatePatientDto'>

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
  immunoType?: string
  responsiblePhysicianId?: string
  includeArchived?: boolean
}

export function listImmunotherapies(
  query: ImmunotherapiesQuery,
  signal?: AbortSignal,
): Promise<ImmunotherapyPage> {
  return apiRequest<unknown>(
    `/immunotherapies/list${toQueryString({ ...query })}`,
    { signal },
  ).then(parseImmunotherapyPage)
}

export function listImmunotherapyTypes(
  signal?: AbortSignal,
): Promise<string[]> {
  return apiRequest<unknown>('/immunotherapies/types', { signal }).then(
    parseImmunotherapyTypes,
  )
}

export function getImmunotherapy(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<ImmunotherapyDetail> {
  return apiRequest<unknown>(`/immunotherapies/${immunotherapyId}`, {
    signal,
  }).then(parseImmunotherapyDetail)
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

    guardian?: {
      fullName: string
      cpf?: string
      phoneNumber: string
    }
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
  return apiRequest<unknown>('/immunotherapies/register', { method: 'POST', body }).then(createContractParser<RegisterImmunotherapyResult>(z.object({ patient: z.object({ id: z.string().min(1), fullName: z.string() }), immunotherapy: z.object({ id: z.string().min(1), patientId: z.string().min(1) }), firstDose: z.object({ id: z.string().min(1), scheduledAt: z.string().datetime({ offset: true }) }) }), 'Recibo de cadastro inválido.'))
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
  asOf?: string
  justification?: string
  status?: TherapyStatus
  responsiblePhysicianId?: string
  page?: number
  pageSize?: number
}

export function exportClinicalDoses(
  query: ClinicalExportQuery,
  signal?: AbortSignal,
): Promise<ClinicalExportPage> {
  return apiRequest<unknown>(
    `/immunotherapies/export${toQueryString({ ...query })}`,
    { signal },
  ).then(parseClinicalExportPage)
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
  professionalId?: string
  page?: number
  pageSize?: number
}

export function listAppointments(
  query: AppointmentsQuery,
  signal?: AbortSignal,
): Promise<AppointmentPage> {
  return apiRequest<unknown>(`/appointments${toQueryString({ ...query })}`, {
    signal,
  }).then(parseAppointmentPage)
}

export function getAppointment(id: string, signal?: AbortSignal): Promise<Appointment> {
  return apiRequest(`/appointments/${id}`, { signal })
}

export function createAppointment(body: {
  patientId: string
  professionalId: string
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
    professionalId?: string
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
  return apiRequest<unknown>(`/doses${toQueryString({ ...query })}`, {
    signal,
  }).then(parseSchedulePage)
}

export function getClinicalMetrics(
  query: { from: string; to: string },
  signal?: AbortSignal,
): Promise<ClinicalMetrics> {
  return apiRequest<unknown>(`/doses/metrics${toQueryString({ ...query })}`, { signal }).then(parseClinicalMetrics)
}

export function listDosesForTherapy(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<DoseRecord[]> {
  return apiRequest<unknown>(`/immunotherapies/${immunotherapyId}/doses`, {
    signal,
  }).then(parseDoseRecords)
}

export function getDose(
  doseId: string,
  signal?: AbortSignal,
): Promise<DoseDetail> {
  return apiRequest<unknown>(`/doses/${doseId}`, { signal }).then(parseDoseDetail)
}

export function previewDose(
  doseId: string,
  body: PreviewDoseBody,
  signal?: AbortSignal,
): Promise<PreviewDoseResult> {
  return apiRequest<unknown>(`/doses/${doseId}/preview`, {
    method: 'POST',
    body,
    signal,
  }).then(parsePreviewDoseResult)
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
  return apiRequest<unknown>(`/doses/${doseId}/administer`, {
    method: 'POST',
    body,
  }).then(parseAdministerDoseResult)
}
