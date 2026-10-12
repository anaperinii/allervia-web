import type { Schema } from '@/shared/api/generated/helpers'

export interface Page<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export type TeamMember = Schema<'TeamMemberDto'>

export type InviteStatus = Schema<'InviteResponseDto'>['status']

export type Invite = Schema<'InviteResponseDto'>

export type InviteContext = Schema<'InviteContextDto'>

export type ProfessionalRoleGrant = Schema<'RoleResponseDto'>

export type ProfessionalProfile = Schema<'ProfessionalResponseDto'>

export type Organization = Schema<'OrganizationResponseDto'>
