import type { BackendRole } from '@/shared/api/contracts/account'

/**
 * Papéis concedíveis pela administração. São exatamente os do servidor: não
 * existe papel de técnico — `NURSING_TECHNICIAN` é profissão e não concede
 * acesso por si só.
 */
export type TeamRole = BackendRole

export interface RoleBadge {
  label: string
  color: string
  bg: string
}

export const ROLE_BADGES: Record<TeamRole, RoleBadge> = {
  ADMINISTRATOR: { label: 'Administrador', color: 'text-violet-400', bg: 'bg-violet-100' },
  PHYSICIAN: { label: 'Médico', color: 'text-brand', bg: 'bg-teal-50' },
  NURSE: { label: 'Enfermeiro', color: 'text-orange-400', bg: 'bg-orange-50' },
  RECEPTIONIST: { label: 'Recepção', color: 'text-cyan-700', bg: 'bg-cyan-50' },
}

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  ADMINISTRATOR:
    'Gerencia equipe, convites, papéis e o cadastro da organização. Não recebe capacidade clínica por este papel.',
  PHYSICIAN:
    'Prescreve imunoterapias, acompanha os próprios pacientes, configura protocolos e acompanha a evolução.',
  NURSE:
    'Registra aplicações e evolução das doses, consulta prontuários e a agenda da organização.',
  RECEPTIONIST:
    'Cadastra e atualiza pacientes e consulta a equipe. Não acessa prescrição nem aplicação.',
}

/** Profissões declaradas no cadastro; descrevem a pessoa, não o acesso. */
export const PROFESSION_LABELS = {
  PHYSICIAN: 'Médico(a)',
  NURSE: 'Enfermeiro(a)',
  NURSING_TECHNICIAN: 'Técnico(a) em Enfermagem',
  RECEPTIONIST: 'Recepção',
} as const
