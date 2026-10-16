import type { Schema } from '@/shared/api/generated/helpers'
import { ORGANIZATION_ID, USER_ID } from './clinical'








export function organization(
  overrides: Partial<Schema<'OrganizationResponseDto'>> = {},
): Schema<'OrganizationResponseDto'> {
  return {
    automationEnabled: true,
    createdAt: '2026-01-01T12:00:00.000Z',
    id: ORGANIZATION_ID,
    isActive: true,
    name: 'Clínica Integrada Princípios',
    revision: 2,
    taxId: '19131243000197',
    timeZone: 'America/Sao_Paulo',
    updatedAt: '2026-02-01T12:00:00.000Z',
    ...overrides,
  }
}

export function automationSettings(
  overrides: Partial<Schema<'AutomationSettingsViewDto'>> = {},
): Schema<'AutomationSettingsViewDto'> {
  return {
    defaults: [
      {
        organizationId: ORGANIZATION_ID,
        route: 'SUBCUTANEOUS',
        versionId: 'version-1',
      },
    ],
    enabled: true,
    revision: 3,
    timeZone: 'America/Sao_Paulo',
    ...overrides,
  }
}


export function notificationPreferences(
  overrides: Partial<Schema<'NotificationPreferenceDto'>>[] = [],
): Schema<'NotificationPreferenceDto'>[] {
  const base: Schema<'NotificationPreferenceDto'>[] = [
    { kind: 'PHYSICIAN_REVIEW_REQUESTED', enabled: true },
    { kind: 'TREATMENT_SUSPENDED', enabled: true },
  ]
  if (overrides.length === 0) return base
  return base.map((preference, index) => ({ ...preference, ...overrides[index] }))
}

export function notification(
  overrides: Partial<Schema<'NotificationDto'>> = {},
): Schema<'NotificationDto'> {
  return {
    body: 'Conduta registrada exige revisão médica.',
    createdAt: '2026-10-09T12:00:00.000Z',
    entityId: 'therapy-1',
    entityType: 'IMMUNOTHERAPY',
    id: 'notification-1',
    kind: 'PHYSICIAN_REVIEW_REQUESTED',
    organizationId: ORGANIZATION_ID,
    outboxEventId: 'outbox-1',
    readAt: null,
    title: 'Revisão médica solicitada',
    userId: USER_ID,
    ...overrides,
  }
}

export function notificationPage(
  items: Schema<'NotificationDto'>[] = [notification()],
  overrides: Partial<Schema<'NotificationPageDto'>> = {},
): Schema<'NotificationPageDto'> {
  return {
    items,
    page: 1,
    pageSize: 20,
    total: items.length,
    unread: items.filter((item) => item.readAt === null).length,
    ...overrides,
  }
}
