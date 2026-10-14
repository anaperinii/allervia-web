import type {
  ProtocolDefinitionDraft,
  ProtocolVersion,
  TreatmentProtocol,
} from '@/shared/api/contracts/protocols'
import { ORGANIZATION_ID, USER_ID } from './clinical'







export function protocolDefinition(
  overrides: Partial<ProtocolDefinitionDraft> = {},
): ProtocolDefinitionDraft {
  return {
    concentrationUnit: 'DILUTION_DENOMINATOR',
    engineVersion: '1',
    route: 'SUBCUTANEOUS',
    schemaVersion: 1,
    steps: [
      {
        concentration: '1000',
        id: 'inicio',
        intervalDays: 7,
        label: 'Início',
        nextStepId: null,
        phase: 'BUILD_UP',
        volume: '0.1',
      },
    ],
    volumeUnit: 'mL',
    ...overrides,
  }
}

export function protocolVersion(
  overrides: Partial<ProtocolVersion> = {},
): ProtocolVersion {
  return {
    createdAt: '2026-09-10T12:00:00.000Z',
    createdById: USER_ID,
    definition: protocolDefinition(),
    engineVersion: '1',
    id: 'version-2',
    number: 2,
    organizationId: ORGANIZATION_ID,
    protocolId: 'protocol-1',
    publishedAt: null,
    publishedById: null,
    revision: 3,
    schemaVersion: 1,
    status: 'DRAFT',
    ...overrides,
  }
}

export function treatmentProtocol(
  overrides: Partial<TreatmentProtocol> = {},
): TreatmentProtocol {
  return {
    available: true,
    createdAt: '2026-09-01T12:00:00.000Z',
    createdById: USER_ID,
    id: 'protocol-1',
    name: 'SCIT ácaros',
    organizationId: ORGANIZATION_ID,
    route: 'SUBCUTANEOUS',
    versions: [
      protocolVersion(),
      protocolVersion({
        id: 'version-1',
        number: 1,
        status: 'PUBLISHED',
        revision: 1,
        createdAt: '2026-09-01T12:00:00.000Z',
        publishedAt: '2026-09-02T12:00:00.000Z',
        publishedById: USER_ID,
      }),
    ],
    ...overrides,
  }
}
