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

// ─── Persistência leve via localStorage ──────────────────────────────────────
const LS_KEY = 'imunecare_user_profile'

function loadPersistedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<UserProfile>
    // Valida que o id ainda existe no PROFILES estático (segurança)
    const base = PROFILES.find((p) => p.id === parsed.id)
    if (!base) return null
    // Mescla campos editáveis em cima do perfil base (preserva role/registration/cpf do base)
    return {
      ...base,
      name: parsed.name ?? base.name,
      email: parsed.email ?? base.email,
      phone: parsed.phone ?? base.phone,
      specialty: parsed.specialty ?? base.specialty,
      institution: parsed.institution ?? base.institution,
      birthDate: parsed.birthDate ?? base.birthDate,
    }
  } catch {
    return null
  }
}

function persistProfile(profile: UserProfile) {
  try {
    // Persiste apenas id + campos editáveis; role/cpf/registration vêm do PROFILES base
    const toSave: Pick<UserProfile, 'id' | EditableProfileFields> = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      specialty: profile.specialty,
      institution: profile.institution,
      birthDate: profile.birthDate,
    }
    localStorage.setItem(LS_KEY, JSON.stringify(toSave))
  } catch {
    // localStorage pode estar bloqueado em alguns contextos — falha silenciosa
  }
}

interface UserState {
  current: UserProfile
  setProfile: (id: string) => void
  updateCurrentProfile: (patch: Pick<UserProfile, EditableProfileFields>) => void
}

export const useUserStore = create<UserState>((set) => ({
  current: loadPersistedProfile() ?? PROFILES.find((p) => p.id === 'doctor_karina')!,
  setProfile: (id) => {
    const p = PROFILES.find((x) => x.id === id)
    if (p) {
      // Ao trocar de perfil, preserva edições locais se o id não mudou
      persistProfile(p)
      set({ current: p })
    }
  },
  updateCurrentProfile: (patch) => set((state) => {
    const updated = { ...state.current, ...patch }
    persistProfile(updated)
    return { current: updated }
  }),
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
