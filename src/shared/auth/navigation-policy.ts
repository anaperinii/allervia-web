import {
  hasPermission,
  type Permission,
} from '@/shared/stores/useUserStore'


export interface RoutePolicy {
  path: string
  label: string

  requires?: Permission

  public?: boolean
}

export const ROUTE_POLICIES: readonly RoutePolicy[] = [

  { path: '/', label: 'Início', public: true },
  { path: '/login', label: 'Entrar', public: true },
  { path: '/register', label: 'Cadastro por convite', public: true },
  { path: '/forgot-password', label: 'Recuperar senha', public: true },
  { path: '/trial', label: 'Pedir demonstração', public: true },


  { path: '/plans', label: 'Planos' },
  { path: '/about', label: 'Sobre' },


  { path: '/immunotherapies', label: 'Imunoterapias', requires: 'view_clinical' },
  { path: '/patient', label: 'Prontuário', requires: 'view_clinical' },
  { path: '/patient-evolution', label: 'Evolução', requires: 'evolve_patient' },
  { path: '/patient-report', label: 'Relatório do paciente', requires: 'emit_report' },
  { path: '/patient-completion', label: 'Conclusão de tratamento', requires: 'inactivate_immunotherapy' },
  { path: '/add-immunotherapy', label: 'Nova imunoterapia', requires: 'add_immunotherapy' },


  { path: '/appointments', label: 'Agendamentos', requires: 'view_appointments' },
  { path: '/dashboard', label: 'Painel de métricas', requires: 'view_dashboard' },
  { path: '/export-report', label: 'Exportação analítica', requires: 'view_dashboard' },
  { path: '/notifications', label: 'Notificações' },


  { path: '/settings', label: 'Configurações' },
  { path: '/profile', label: 'Perfil' },
  { path: '/security', label: 'Segurança' },
  { path: '/help', label: 'Ajuda' },


  { path: '/protocols', label: 'Protocolos', requires: 'view_protocols' },
  { path: '/protocol-editor', label: 'Editor de protocolo', requires: 'adjust_protocol' },
  { path: '/protocol-lab', label: 'Simulação de protocolo', requires: 'view_protocols' },
  { path: '/migration', label: 'Migração de tratamentos', requires: 'adjust_protocol' },
  { path: '/advanced-settings', label: 'Avançado', requires: 'advanced_settings' },
  { path: '/teams', label: 'Equipes', requires: 'manage_team' },
  { path: '/toast-lab', label: 'Laboratório de avisos' },
]


export function policyFor(pathname: string): RoutePolicy | undefined {
  const normalized = pathname.split('?')[0].replace(/\/+$/, '') || '/'
  const exact = ROUTE_POLICIES.find((policy) => policy.path === normalized)
  if (exact) return exact
  return ROUTE_POLICIES.find(
    (policy) => policy.path !== '/' && normalized.startsWith(`${policy.path}/`),
  )
}

export function isPublicRoute(pathname: string): boolean {
  return policyFor(pathname)?.public === true
}


export function canAccess(capabilities: string[], pathname: string): boolean {
  const policy = policyFor(pathname)
  if (!policy) return false
  if (policy.public) return true
  if (!policy.requires) return true
  return hasPermission(capabilities, policy.requires)
}


const DESTINATION_ORDER = [
  '/immunotherapies',
  '/appointments',
  '/dashboard',
  '/notifications',
  '/profile',
]

export function defaultDestination(capabilities: string[]): string {
  return (
    DESTINATION_ORDER.find((path) => canAccess(capabilities, path)) ?? '/profile'
  )
}


const BACKSLASH = String.fromCharCode(92)

export function safeReturnTo(
  raw: string | null | undefined,
  capabilities: string[],
): string | null {
  if (typeof raw !== 'string' || raw.length === 0) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null

  if (raw.includes(BACKSLASH) || [...raw].some((char) => char <= ' ')) return null
  const [pathname] = raw.split('#')
  const policy = policyFor(pathname)
  if (!policy || policy.public) return null
  return canAccess(capabilities, pathname) ? raw : null
}

export function destinationAfterLogin(
  returnTo: string | null | undefined,
  capabilities: string[],
): string {
  return safeReturnTo(returnTo, capabilities) ?? defaultDestination(capabilities)
}
