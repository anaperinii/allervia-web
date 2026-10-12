import type { Schema } from '@/shared/api/generated/helpers'

export type ProtocolVersionStatus = Schema<'ProtocolVersionDto'>['status']
export type ProtocolPhase = Schema<'ProtocolStepResponseDto'>['phase']

export type ProtocolStep = Schema<'ProtocolStepResponseDto'>

export type ProtocolDefinitionDraft = Schema<'ProtocolDefinitionDto'>

export type ProtocolVersion = Schema<'ProtocolVersionDto'>

export type TreatmentProtocol = Schema<'TreatmentProtocolDto'>

export type AutomationSettings = Schema<'AutomationSettingsViewDto'>

export type SimulationResult =
  | Schema<'SimulationRecommendedDto'>
  | Schema<'SimulationEndOfSequenceDto'>
  | Schema<'SimulationUnresolvedDto'>

export type ResolvedPrescriptionInput = Schema<'ResolvedPrescriptionInputDto'>

export type SimulateProtocolBody = Schema<'SimulateProtocolDto'>

export interface MigrationReportRow {
  therapyId: string
  revision: number
  prescriptionId: string | null
  patient: Schema<'MigrationPatientRefDto'>
  immunoType: string
  extract: string
  status: Schema<'MigrationTherapyReportDto'>['status']
  administrationRoute: string
  inductionStartDate: string
  target: { concentration: string; volume: string | null }
  pendingDoses: Schema<'MigrationPendingDoseDto'>[]
  pendingDoseIds: string[]
  issues: string[]
  decimals: Schema<'MigrationDecimalDto'>[]
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
  | Schema<'BindLegacyResultDto'>
  | Schema<'BindLegacyDryRunResultDto'>

export const PROTOCOL_ERROR_CODES = {
  staleRevision: 'STALE_PROTOCOL_REVISION',
  publishedImmutable: 'PUBLISHED_VERSION_IMMUTABLE',
  publishedRequired: 'PUBLISHED_VERSION_REQUIRED',
  invalidProtocol: 'INVALID_PROTOCOL',
  clinicalAuthorRequired: 'CLINICAL_AUTHOR_REQUIRED',
  transitionReviewRequired: 'CLINICAL_TRANSITION_REVIEW_REQUIRED',
} as const
