import { create } from 'zustand'

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'technician'

export interface UserProfile {
  id: string
  name: string
  role: UserRole
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
  | 'view_dashboard'

export const PROFILES: UserProfile[] = [
  {
    id: 'admin',
    name: 'Carla Souza',
    role: 'admin',
    title: 'Administradora',
    registration: 'Gestão clínica',
    email: 'carla.souza@clinica.com',
    phone: '(62) 99812-4407',
    specialty: 'Gestão clínica',
    institution: 'Clínica Integrada Princípios',
    birthDate: '1978-11-02',
    cpf: '512.488.901-22',
  },
  {
    id: 'doctor_karina',
    name: 'Dra. Karina Martins',
    role: 'doctor',
    title: 'Médica Alergista',
    registration: 'CRM/GO 24.815',
    email: 'karina@clinica.com',
    phone: '(62) 99557-1423',
    specialty: 'Alergologia e Imunologia',
    institution: 'Clínica Integrada Princípios',
    birthDate: '1985-03-15',
    cpf: '711.905.744-89',
  },
  {
    id: 'doctor_andre',
    name: 'Dr. André Lima',
    role: 'doctor',
    title: 'Médico Alergista',
    registration: 'CRM/GO 28.104',
    email: 'andre@clinica.com',
    phone: '(62) 98221-7066',
    specialty: 'Alergologia e Imunologia',
    institution: 'Clínica Integrada Princípios',
    birthDate: '1982-07-29',
    cpf: '684.327.119-04',
  },
  {
    id: 'nurse_jaqueline',
    name: 'Jaqueline Oliveira',
    role: 'nurse',
    title: 'Enfermeira',
    registration: 'COREN/GO 318.942',
    email: 'jaqueline@clinica.com',
    phone: '(62) 99431-5582',
    specialty: 'Enfermagem alergológica',
    institution: 'Clínica Integrada Princípios',
    birthDate: '1990-05-18',
    cpf: '802.114.557-30',
  },
  {
    id: 'technician_rafael',
    name: 'Rafael Mendes',
    role: 'technician',
    title: 'Técnico em Enfermagem',
    registration: 'COREN/GO 415.327',
    email: 'rafael@clinica.com',
    phone: '(62) 98112-3309',
    specialty: 'Técnico em enfermagem',
    institution: 'Clínica Integrada Princípios',
    birthDate: '1995-09-04',
    cpf: '935.482.667-15',
  },
]

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  doctor: 'Médico',
  nurse: 'Enfermeiro',
  technician: 'Técnico em Enfermagem',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['edit_patient_data', 'emit_report', 'lgpd_portability', 'new_appointment', 'manage_team', 'advanced_settings', 'view_dashboard'],
  doctor: ['adjust_protocol', 'inactivate_immunotherapy', 'reactivate_patient', 'edit_patient_data', 'evolve_patient', 'emit_report', 'lgpd_portability', 'add_immunotherapy', 'new_appointment', 'advanced_settings', 'view_dashboard'],
  nurse: ['evolve_patient', 'emit_report', 'new_appointment', 'view_dashboard'],
  technician: ['evolve_patient'],
}

interface UserState {
  current: UserProfile
  setProfile: (id: string) => void
  updateCurrentProfile: (patch: Pick<UserProfile, EditableProfileFields>) => void
}

export const useUserStore = create<UserState>((set) => ({
  current: PROFILES.find((p) => p.id === 'doctor_karina')!,
  setProfile: (id) => {
    const p = PROFILES.find((x) => x.id === id)
    if (p) set({ current: p })
  },
  updateCurrentProfile: (patch) => set((state) => ({ current: { ...state.current, ...patch } })),
}))

export function useHasPermission(permission: Permission): boolean {
  const role = useUserStore((s) => s.current.role)
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function useDoctorFilter(): string | null {
  const current = useUserStore((s) => s.current)
  return current.role === 'doctor' ? current.name : null
}

export const APPLICATION_ADMINISTRATORS: UserProfile[] = PROFILES.filter(
  (p) => p.role === 'nurse' || p.role === 'technician',
)
