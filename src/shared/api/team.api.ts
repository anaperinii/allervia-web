import { apiRequest } from '@/shared/api/client'
import type { BackendRole, Profession } from '@/shared/api/contracts/account'
import type {
  Invite,
  InviteContext,
  Organization,
  Page,
  ProfessionalProfile,
  TeamMember,
} from '@/shared/api/contracts/team'

export interface TeamQuery {
  page?: number
  pageSize?: number
  search?: string
  role?: BackendRole
  profession?: Profession
  isActive?: boolean
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

export function listTeamMembers(
  query: TeamQuery,
  signal?: AbortSignal,
): Promise<Page<TeamMember>> {
  return apiRequest(`/professionals${toQueryString({ ...query })}`, { signal })
}

export function updateMemberAccess(
  professionalId: string,
  isActive: boolean,
): Promise<{ professionalId: string; userId: string; isActive: boolean }> {
  return apiRequest(`/professionals/${professionalId}/access`, {
    method: 'PATCH',
    body: { isActive },
  })
}

export function updateTeamMember(
  professionalId: string,
  body: Partial<{
    fullName: string
    phoneNumber: string
    profession: Profession
    councilNumber: string
    councilUf: string
  }>,
): Promise<ProfessionalProfile> {
  return apiRequest(`/professionals/${professionalId}`, {
    method: 'PATCH',
    body,
  })
}

export function readOwnProfile(
  signal?: AbortSignal,
): Promise<ProfessionalProfile> {
  return apiRequest('/professionals/me', { signal })
}

export function updateOwnProfile(
  body: Partial<{
    fullName: string
    phoneNumber: string
    councilNumber: string
    councilUf: string
  }>,
): Promise<ProfessionalProfile> {
  return apiRequest('/professionals/me', { method: 'PATCH', body })
}

export interface InviteQuery {
  page?: number
  pageSize?: number
  search?: string
  role?: BackendRole
  onlyActive?: boolean
  includeExpired?: boolean
}

export function listInvites(
  query: InviteQuery,
  signal?: AbortSignal,
): Promise<Page<Invite>> {
  return apiRequest(`/onboarding/invites/list${toQueryString({ ...query })}`, {
    signal,
  })
}

export function createInvite(body: {
  email: string
  fullName: string
  userRole: BackendRole
}): Promise<Invite> {
  return apiRequest('/onboarding/invites', { method: 'POST', body })
}

export function cancelInvite(inviteId: string): Promise<void> {
  return apiRequest<void>(`/onboarding/invites/${inviteId}`, {
    method: 'DELETE',
  })
}

/** Aberto pelo link do e-mail; ainda não há sessão neste momento. */
export function readInviteContext(
  token: string,
  signal?: AbortSignal,
): Promise<InviteContext> {
  return apiRequest(`/onboarding/invites/context/${encodeURIComponent(token)}`, {
    signal,
  })
}

export function completeInviteRegistration(
  token: string,
  body: {
    fullName: string
    password: string
    profession: Profession
    phoneNumber: string
  },
): Promise<{ userId: string; professionalId: string; email: string }> {
  return apiRequest(`/onboarding/registration/${encodeURIComponent(token)}`, {
    method: 'POST',
    body,
  })
}

export function readOrganization(signal?: AbortSignal): Promise<Organization> {
  return apiRequest('/organization/me', { signal })
}

export function updateOrganization(
  body: Partial<{ name: string; timeZone: string }>,
): Promise<Organization> {
  return apiRequest('/organization/me', { method: 'PATCH', body })
}

export function grantRole(body: {
  professionalId: string
  name: BackendRole
}): Promise<{ id: string; role: BackendRole }> {
  return apiRequest('/roles', { method: 'POST', body })
}

export function revokeRole(roleId: string): Promise<void> {
  return apiRequest<void>(`/roles/${roleId}`, { method: 'DELETE' })
}
