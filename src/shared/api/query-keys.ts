import { useUserStore } from '@/shared/stores/useUserStore'
const currentUserId = () => useUserStore.getState().current?.id ?? 'anonymous'

export const queryKeys = {
  audit: (organizationId: string, filters: Record<string, unknown>) => ['audit-logs', organizationId, currentUserId(), filters] as const,
  notifications: (organizationId: string, userId: string, filters: Record<string, unknown> = {}) => ['notifications', organizationId, userId, filters] as const,
  notificationScope: (organizationId: string, userId: string) => ['notifications', organizationId, userId] as const,
  notificationPreferences: (organizationId: string, userId: string) => ['notification-preferences', organizationId, userId] as const,
  supportRequests: (organizationId: string, userId: string) => ['support-requests', organizationId, userId] as const,
  patientRecord: (organizationId: string, patientId: string) => ['clinical', organizationId, currentUserId(), 'patients', 'record', patientId] as const,
  statusHistory: (organizationId: string, filters: Record<string, unknown>) => ['clinical', organizationId, currentUserId(), 'status-history', filters] as const,
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
  memberRoles: (organizationId: string, professionalId: string) =>
    ['team', organizationId, 'roles', professionalId] as const,
  inviteContext: (token: string) => ['invites', 'context', token] as const,

  clinical: (organizationId: string) => ['clinical', organizationId, currentUserId()] as const,

  patients: (organizationId: string, filters: Record<string, unknown>) =>
    ['clinical', organizationId, currentUserId(), 'patients', filters] as const,
  patient: (organizationId: string, patientId: string) =>
    ['clinical', organizationId, currentUserId(), 'patients', 'detail', patientId] as const,
  immunotherapies: (organizationId: string, filters: Record<string, unknown>) =>
    ['clinical', organizationId, currentUserId(), 'immunotherapies', filters] as const,
  immunotherapyTypes: (organizationId: string) =>
    ['clinical', organizationId, currentUserId(), 'immunotherapies', 'types'] as const,
  protocols: (organizationId: string) =>
    ['clinical', organizationId, currentUserId(), 'protocols'] as const,
  protocolVersion: (organizationId: string, versionId: string) =>
    ['clinical', organizationId, currentUserId(), 'protocols', 'version', versionId] as const,
  automation: (organizationId: string) =>
    ['clinical', organizationId, currentUserId(), 'protocols', 'automation'] as const,

  immunotherapy: (organizationId: string, immunotherapyId: string) =>
    [
      'clinical',
      organizationId,
      currentUserId(),
      'immunotherapies',
      'detail',
      immunotherapyId,
    ] as const,

  doses: (organizationId: string, immunotherapyId: string) =>
    ['clinical', organizationId, currentUserId(), 'doses', 'therapy', immunotherapyId] as const,
  dose: (organizationId: string, doseId: string) =>
    ['clinical', organizationId, currentUserId(), 'doses', 'detail', doseId] as const,
  migrationInventory: (organizationId: string) =>
    ['clinical', organizationId, currentUserId(), 'protocols', 'migration'] as const,

  schedule: (organizationId: string, filters: Record<string, unknown>) =>
    ['clinical', organizationId, currentUserId(), 'doses', 'schedule', filters] as const,
  clinicalMetrics: (organizationId: string, filters: Record<string, unknown>) =>
    ['clinical', organizationId, currentUserId(), 'doses', 'metrics', filters] as const,

  calendarConnection: () => ['integrations', 'google-calendar', 'me', currentUserId()] as const,
  calendarConnections: (organizationId: string) =>
    ['integrations', 'google-calendar', organizationId] as const,
} as const
