import { apiRequest } from '@/shared/api/client'
import type {
  AdministrationRoute,
  ImmunotherapyDetail,
  ImmunotherapyPage,
  PatientDetail,
  PatientPage,
  TherapyStatus,
  TherapySummary,
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
