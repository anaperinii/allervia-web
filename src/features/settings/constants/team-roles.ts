export type TeamRole = 'admin' | 'doctor' | 'nurse' | 'technician'

export interface RoleBadge {
  label: string
  color: string
  bg: string
}

export const ROLE_BADGES: Record<TeamRole, RoleBadge> = {
  admin: { label: 'Administrador', color: 'text-violet-400', bg: 'bg-violet-100' },
  doctor: { label: 'Médico', color: 'text-brand', bg: 'bg-teal-50' },
  nurse: { label: 'Enfermeiro', color: 'text-orange-400', bg: 'bg-orange-50' },
  technician: { label: 'Técnico', color: 'text-cyan-700', bg: 'bg-cyan-50' },
}

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  admin: 'Acesso total ao sistema: gerenciar equipes, configurações, relatórios e todos os dados clínicos.',
  doctor: 'Prescrever imunoterapias, acompanhar pacientes, ajustar protocolos e gerar relatórios clínicos.',
  nurse: 'Registrar aplicações, evoluir pacientes, monitorar reações adversas e gerenciar agendamentos.',
  technician: 'Registrar aplicações sob supervisão, consultar prontuários e auxiliar no controle de estoque.',
}
