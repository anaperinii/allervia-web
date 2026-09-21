import type { AdministrationRoute } from '@/shared/api/contracts/clinical'

export type ProtocolVersionStatus = 'DRAFT' | 'PUBLISHED' | 'RETIRED'
export type ProtocolPhase = 'BUILD_UP' | 'MAINTENANCE'

/**
 * Etapa do protocolo como o motor a entende: valores exatos em string com
 * ponto, intervalo inteiro em dias e sucessor explícito. O sucessor pode
 * apontar para a própria etapa (permanência) ou ser nulo (fim de sequência).
 */
export interface ProtocolStep {
  id: string
  label: string
  phase: ProtocolPhase
  concentration: string
  volume: string
  intervalDays: number
  nextStepId: string | null
}

/** Rascunho editável; identidade de versão é atribuída pelo servidor. */
export interface ProtocolDefinitionDraft {
  schemaVersion: 1
  engineVersion: '1'
  route: 'SUBCUTANEOUS'
  volumeUnit: 'mL'
  concentrationUnit: 'DILUTION_DENOMINATOR'
  steps: ProtocolStep[]
}

export interface ProtocolVersion {
  id: string
  protocolId: string
  number: number
  status: ProtocolVersionStatus
  definition: ProtocolDefinitionDraft & Record<string, unknown>
  revision: number
  createdAt: string
  publishedAt: string | null
}

export interface TreatmentProtocol {
  id: string
  name: string
  route: AdministrationRoute
  available: boolean
  createdAt: string
  versions: ProtocolVersion[]
}

export interface AutomationSettings {
  enabled: boolean
  timeZone: string
  defaults: Array<{
    organizationId: string
    route: AdministrationRoute
    versionId: string
  }>
}

export type SimulationResult =
  | {
      kind: 'RECOMMENDED'
      protocolVersionId: string
      fromStepId: string
      stepId: string
      label: string
      phase: ProtocolPhase
      values: {
        concentration: string
        volume: string
        intervalDays: number
      }
    }
  | { kind: 'END_OF_SEQUENCE'; protocolVersionId: string; fromStepId: string }
  | { kind: 'UNRESOLVED'; code: string }

/** Prescrição resolvida enviada na vinculação de tratamento legado. */
export interface ResolvedPrescriptionInput {
  protocolId: string
  protocolVersionId: string
  route: 'SUBCUTANEOUS'
  stepIds: string[]
  startingStepId: string
  targetStepId: string
}

/** Linha do inventário de migração: um tratamento sob revisão clínica. */
export interface MigrationReportRow {
  therapyId: string
  revision: number
  prescriptionId: string | null
  patient: { id: string; fullName: string; isActive: boolean }
  immunoType: string
  extract: string
  status: 'IN_PROGRESS' | 'SUSPENDED' | 'COMPLETED'
  administrationRoute: string
  inductionStartDate: string
  target: { concentration: string; volume: string | null }
  pendingDoses: {
    id: string
    scheduledAt: string
    concentration: string
    volume: string
    intervalDays: number
  }[]
  pendingDoseIds: string[]
  issues: string[]
  decimals: {
    doseId: string
    storedVolumeText: string
    decimalText: string
    exactCandidate: boolean
    historicalRecordUnchanged: boolean
  }[]
}

export interface MigrationInventory {
  report: MigrationReportRow[]
  originDraft: ProtocolDefinitionDraft & {
    provenance: string
    requiresClinicalTransitionReview: boolean
  }
  dryRun: true
}

export type BindLegacyResult =
  | { alreadyBound: true; prescriptionId: string }
  | { alreadyBound: false; prescriptionId: string }
  | {
      dryRun: true
      therapyId: string
      doseId: string
      stepId: string
      historicalDosesUnchanged: true
    }

/** Códigos de conflito do catálogo; a UI ramifica por eles, não pelo texto. */
export const PROTOCOL_ERROR_CODES = {
  staleRevision: 'STALE_PROTOCOL_REVISION',
  publishedImmutable: 'PUBLISHED_VERSION_IMMUTABLE',
  publishedRequired: 'PUBLISHED_VERSION_REQUIRED',
  invalidProtocol: 'INVALID_PROTOCOL',
  clinicalAuthorRequired: 'CLINICAL_AUTHOR_REQUIRED',
  transitionReviewRequired: 'CLINICAL_TRANSITION_REVIEW_REQUIRED',
} as const
