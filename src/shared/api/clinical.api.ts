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
  /** Instante RFC3339 com offset explícito. */
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

/**
 * Cadastro atômico de prescrição. A chave de idempotência pertence à intenção
 * confirmada: reenvio por perda de resposta usa a MESMA chave e corpo.
 */
export function registerImmunotherapy(
  body: RegisterImmunotherapyBody,
): Promise<RegisterImmunotherapyResult> {
  return apiRequest('/immunotherapies/register', { method: 'POST', body })
}

/**
 * Ciclo de vida clínico: suspensão, retomada e encerramento com motivo,
 * autoria e efeitos explícitos. O status é consequência do evento.
 */
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

/**
 * Revisão individual de prescrição entre versões publicadas: snapshot novo,
 * histórico preservado e previsão pendente reancorada. Ensaio por padrão.
 */
export function revisePrescription(
  immunotherapyId: string,
  body: RevisePrescriptionBody,
): Promise<RevisePrescriptionResult> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/prescription/revision`, {
    method: 'POST',
    body,
  })
}

/**
 * Retratação auditada: a aplicação vira ENTERED_IN_ERROR com valores
 * preservados; a sucessora pendente é arquivada e a previsão original volta.
 */
export function retractDose(
  doseId: string,
  body: RetractDoseBody,
): Promise<RetractDoseResult> {
  return apiRequest(`/doses/${doseId}/retract`, { method: 'POST', body })
}

/** Observação pós-aplicação tardia: registro adicional imutável. */
export function addLateObservation(
  doseId: string,
  body: LateObservationBody,
): Promise<{ addendum: DoseObservationAddendum; suspensionEventId: string | null }> {
  return apiRequest(`/doses/${doseId}/observations`, { method: 'POST', body })
}

export interface ClinicalExportQuery {
  /** Corte temporal (ISO com offset): congela o conjunto exportado. */
  asOf: string
  status?: TherapyStatus
  responsiblePhysicianId?: string
  page?: number
  pageSize?: number
}

/**
 * Conjunto completo para exportação, paginado sobre o corte temporal. A
 * solicitação é registrada em auditoria pelo servidor na primeira página.
 */
export function exportClinicalDoses(
  query: ClinicalExportQuery,
  signal?: AbortSignal,
): Promise<ClinicalExportPage> {
  return apiRequest(`/immunotherapies/export${toQueryString({ ...query })}`, {
    signal,
  })
}

/** Trilha clínica do tratamento, autorizada pelo escopo clínico. */
export function getClinicalHistory(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<ClinicalHistory> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/history`, { signal })
}

/** Auditoria administrativa (capacidade auditLogs:read; hoje, administração). */
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

/** Compromissos de agenda: entidade própria, distinta da dose clínica. */
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
  /** Instante RFC3339 com offset explícito (inclusivo). */
  from: string
  to: string
  status?: DoseStatus
  search?: string
  responsiblePhysicianId?: string
  page?: number
  pageSize?: number
}

/** Agenda agregada do período: uma consulta, não um histórico por tratamento. */
export function listDoseSchedule(
  query: ScheduleQuery,
  signal?: AbortSignal,
): Promise<SchedulePage> {
  return apiRequest(`/doses${toQueryString({ ...query })}`, { signal })
}

/** Indicadores oficiais do período no fuso clínico da organização. */
export function getClinicalMetrics(
  query: { from: string; to: string },
  signal?: AbortSignal,
): Promise<ClinicalMetrics> {
  return apiRequest(`/doses/metrics${toQueryString({ ...query })}`, { signal })
}

/** Histórico persistido de doses do tratamento, previsto e realizado. */
export function listDosesForTherapy(
  immunotherapyId: string,
  signal?: AbortSignal,
): Promise<DoseRecord[]> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/doses`, { signal })
}

/** Dose com valores permitidos pela prescrição e revisões atuais. */
export function getDose(
  doseId: string,
  signal?: AbortSignal,
): Promise<DoseDetail> {
  return apiRequest(`/doses/${doseId}`, { signal })
}

/**
 * Prévia da sucessora a partir de um valor hipotético administrado. Depende do
 * corpo e das revisões: mudar dose, valor ou instante invalida a prévia.
 */
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

/** Edita a previsão pendente com motivo e revisões; nunca cria sucessora. */
export function updateScheduledDose(
  doseId: string,
  body: UpdateScheduledDoseBody,
): Promise<DoseRecord & { therapyRevision: number }> {
  return apiRequest(`/doses/${doseId}/scheduled`, { method: 'PATCH', body })
}

/**
 * Comando de administração: aplicação, observações, conduta imediata e a
 * sucessora nascem em uma única transação. Reenvio por perda de resposta usa a
 * MESMA chave e corpo.
 */
export function administerDose(
  doseId: string,
  body: AdministerDoseBody,
): Promise<AdministerDoseResult> {
  return apiRequest(`/doses/${doseId}/administer`, { method: 'POST', body })
}
