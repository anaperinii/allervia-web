import { apiRequest } from '@/shared/api/client'
import type {
  AdministerDoseBody,
  AdministerDoseResult,
  AdministrationRoute,
  DoseDetail,
  DoseRecord,
  ImmunotherapyDetail,
  ImmunotherapyPage,
  PatientDetail,
  PatientPage,
  PreviewDoseBody,
  PreviewDoseResult,
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

/** Status simples do tratamento; motivos estruturados são extensão da I9. */
export function updateTherapyStatus(
  immunotherapyId: string,
  body: { expectedRevision: number; status: TherapyStatus },
): Promise<unknown> {
  return apiRequest(`/immunotherapies/${immunotherapyId}/status`, {
    method: 'PATCH',
    body,
  })
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
