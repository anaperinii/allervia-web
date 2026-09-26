import { create } from 'zustand'
import type { AccountContext, BackendRole } from '@/shared/api/contracts/account'

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist'

export interface UserProfile {
  id: string
  name: string
  role: UserRole
  roles: UserRole[]
  title: string
  registration: string
  email: string
  phone: string
  specialty: string
  institution: string
  birthDate: string
  cpf: string
}

export type EditableProfileFields =
  | 'name'
  | 'email'
  | 'phone'
  | 'specialty'
  | 'institution'
  | 'birthDate'

export type Permission =
  | 'adjust_protocol'
  | 'edit_scheduled_dose'
  | 'inactivate_immunotherapy'
  | 'reactivate_patient'
  | 'edit_patient_data'
  | 'evolve_patient'
  | 'emit_report'
  | 'lgpd_portability'
  | 'add_immunotherapy'
  | 'new_appointment'
  | 'manage_team'
  | 'advanced_settings'
  | 'view_protocols'
  | 'view_dashboard'
  | 'view_audit'

export const PERMISSION_CAPABILITIES: Record<Permission, string> = {
  adjust_protocol: 'protocols:manage',
  edit_scheduled_dose: 'doses:update',
  inactivate_immunotherapy: 'immunotherapies:update',
  reactivate_patient: 'immunotherapies:update',
  edit_patient_data: 'patients:update',
  evolve_patient: 'doses:create',
  emit_report: 'immunotherapies:read',
  lgpd_portability: 'patients:read',
  add_immunotherapy: 'immunotherapies:create',
  new_appointment: 'appointments:manage',
  manage_team: 'professionals:manage',
  advanced_settings: 'protocols:manage',
  view_protocols: 'protocols:read',
  view_dashboard: 'immunotherapies:read',
  view_audit: 'auditLogs:read',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  nurse: 'Enfermeiro',
  receptionist: 'Recepção',
}

const ROLE_BY_BACKEND: Record<BackendRole, UserRole> = {
  ADMINISTRATOR: 'admin',
  PHYSICIAN: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
}

const ROLE_PRECEDENCE: UserRole[] = ['admin', 'doctor', 'nurse', 'receptionist']

const PROFESSION_TITLES: Record<string, string> = {
  PHYSICIAN: 'Médico(a)',
  NURSE: 'Enfermeiro(a)',
  NURSING_TECHNICIAN: 'Técnico(a) em Enfermagem',
  RECEPTIONIST: 'Recepção',
}

function toProfile(context: AccountContext): UserProfile {
  const roles = context.roles.map((role) => ROLE_BY_BACKEND[role])
  const primary =
    ROLE_PRECEDENCE.find((role) => roles.includes(role)) ?? 'receptionist'
  const professional = context.professional

  return {
    id: context.user.id,
    name: professional?.fullName ?? context.user.email,
    role: primary,
    roles,
    title: professional
      ? (PROFESSION_TITLES[professional.profession] ?? ROLE_LABELS[primary])
      : ROLE_LABELS[primary],
    registration:
      professional?.councilNumber && professional.councilUf
        ? `${professional.councilNumber}/${professional.councilUf}`
        : '',
    email: context.user.email,
    phone: professional?.phoneNumber ?? '',
    specialty: professional
      ? (PROFESSION_TITLES[professional.profession] ?? '')
      : '',
    institution: context.organization?.name ?? '',
    birthDate: '',
    cpf: '',
  }
}

interface UserState {
  current: UserProfile | null
  capabilities: string[]
  syncFromAccount: (context: AccountContext | null) => void
  updateCurrentProfile: (patch: Partial<Pick<UserProfile, EditableProfileFields>>) => void
}

export const useUserStore = create<UserState>((set) => ({
  current: null,
  capabilities: [],
  syncFromAccount: (context) =>
    set(
      context
        ? { current: toProfile(context), capabilities: context.capabilities }
        : { current: null, capabilities: [] },
    ),
  updateCurrentProfile: (patch) =>
    set((state) =>
      state.current ? { current: { ...state.current, ...patch } } : state,
    ),
}))

export function useCurrentUser(): UserProfile {
  const current = useUserStore((s) => s.current)
  if (!current) {
    throw new Error('Perfil indisponível: a sessão ainda não foi carregada.')
  }
  return current
}

export function useHasPermission(permission: Permission): boolean {
  const capabilities = useUserStore((s) => s.capabilities)
  return capabilities.includes(PERMISSION_CAPABILITIES[permission])
}

export function hasPermission(
  capabilities: string[],
  permission: Permission,
): boolean {
  return capabilities.includes(PERMISSION_CAPABILITIES[permission])
}

export function useDoctorFilter(): string | null {
  const current = useUserStore((s) => s.current)
  if (!current) return null
  return current.role === 'doctor' ? current.name : null
}
