import type { BackendRole, Profession } from '@/shared/api/contracts/account'

/** Envelope de listagem paginada usado pelas consultas administrativas. */
export interface Page<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface TeamMember {
  professionalId: string
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  profession: Profession
  councilNumber: string | null
  councilUf: string | null
  roles: BackendRole[]
  isActive: boolean
  createdAt: string
}

export type InviteStatus = 'ACTIVE' | 'EXPIRED' | 'USED' | 'CANCELLED'

export interface Invite {
  id: string
  email: string
  fullName: string
  role: BackendRole
  status: InviteStatus
  expiresAt: string
  usedAt: string | null
  createdAt: string
  createdBy?: { id: string; email: string }
}

/** Contexto mínimo mostrado a quem abre o link do convite. */
export interface InviteContext {
  email: string
  fullName: string
  role: BackendRole
  organizationName: string
  expiresAt: string
}

export interface ProfessionalProfile {
  id: string
  userId: string
  organizationId: string
  fullName: string
  phoneNumber: string
  profession: Profession
  councilNumber: string | null
  councilUf: string | null
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  taxId: string
  isActive: boolean
  timeZone: string
  automationEnabled: boolean
  createdAt: string
  updatedAt: string
}
