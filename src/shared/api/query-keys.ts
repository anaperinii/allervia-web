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

  organization: () => ['organization', 'me'] as const,
  professionalProfile: () => ['professionals', 'me'] as const,

  team: (organizationId: string, filters: Record<string, unknown>) =>
    ['team', organizationId, filters] as const,
  invites: (organizationId: string, filters: Record<string, unknown>) =>
    ['invites', organizationId, filters] as const,
  inviteContext: (token: string) => ['invites', 'context', token] as const,

  /** Prefixo dos dados clínicos, sempre escopados por organização. */
  clinical: (organizationId: string) => ['clinical', organizationId] as const,

  patients: (organizationId: string, filters: Record<string, unknown>) =>
    ['clinical', organizationId, 'patients', filters] as const,
  patient: (organizationId: string, patientId: string) =>
    ['clinical', organizationId, 'patients', 'detail', patientId] as const,
  immunotherapies: (organizationId: string, filters: Record<string, unknown>) =>
    ['clinical', organizationId, 'immunotherapies', filters] as const,
  protocols: (organizationId: string) =>
    ['clinical', organizationId, 'protocols'] as const,
  protocolVersion: (organizationId: string, versionId: string) =>
    ['clinical', organizationId, 'protocols', 'version', versionId] as const,
  automation: (organizationId: string) =>
    ['clinical', organizationId, 'protocols', 'automation'] as const,

  immunotherapy: (organizationId: string, immunotherapyId: string) =>
    [
      'clinical',
      organizationId,
      'immunotherapies',
      'detail',
      immunotherapyId,
    ] as const,

  doses: (organizationId: string, immunotherapyId: string) =>
    ['clinical', organizationId, 'doses', 'therapy', immunotherapyId] as const,
  dose: (organizationId: string, doseId: string) =>
    ['clinical', organizationId, 'doses', 'detail', doseId] as const,
} as const
