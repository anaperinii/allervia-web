/**
 * Chaves de consulta. Todas carregam o contexto de sessão e organização: dados
 * de uma organização nunca podem ser reaproveitados por outra, nem sobreviver a
 * uma troca de usuário.
 */
export const queryKeys = {
  session: () => ['session'] as const,
  account: () => ['account', 'me'] as const,
  devices: () => ['account', 'devices'] as const,
  mfaFactors: () => ['account', 'mfa-factors'] as const,

  /** Prefixo dos dados clínicos, sempre escopados por organização. */
  clinical: (organizationId: string) => ['clinical', organizationId] as const,
} as const
