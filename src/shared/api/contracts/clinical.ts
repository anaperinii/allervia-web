import type { Page } from '@/shared/api/contracts/team'
import type { Schema } from '@/shared/api/generated/helpers'

export type AdministrationRoute =
  Schema<'ImmunotherapyListItemDto'>['administrationRoute']
export type TherapyStatus = Schema<'ImmunotherapyListItemDto'>['status']
export type DoseStatus = Schema<'DoseRecordDto'>['status']

export type ResponsiblePhysician = Schema<'ResponsiblePhysicianDto'>

export type PatientGuardian = Schema<'PatientGuardianDto'>

export type TherapySummary = Schema<'TherapySummaryDto'>

export type PatientListItem = Schema<'PatientListItemDto'>

export type PatientDetail = Schema<'PatientDetailDto'>

export type ImmunotherapyListItem = Schema<'ImmunotherapyListItemDto'>

export type ImmunotherapyDetail = Schema<'ImmunotherapyDetailDto'>

export type PatientPage = Page<PatientListItem>
export type ImmunotherapyPage = Page<ImmunotherapyListItem>

export type DoseObservationPhase = Schema<'DoseObservationDto'>['phase']
export type DoseImmediateConduct = Schema<'DoseImmediateConductDto'>['type']

export type DoseValues = Schema<'DoseValuesResponseDto'>

export type DoseObservation = Schema<'DoseObservationResponseDto'>

export type DoseRecord = Schema<'DoseRecordDto'>

export type DoseDetail = Schema<'DoseDetailResponseDto'>

export type DoseValuesBody = Schema<'ConfiguredDoseValuesDto'>

export type DoseRevisionBody = Pick<
  Schema<'DosePreviewDto'>,
  'expectedRevision' | 'expectedTherapyRevision'
>

export type PreviewDoseBody = Schema<'DosePreviewDto'>

export type PreviewDoseResult = Schema<'DosePreviewResponseDto'>

export type UpdateScheduledDoseBody = Schema<'UpdateScheduledDoseDto'>

export type DoseObservationBody = Schema<'DoseObservationDto'>

export type AdministerDoseBody = Schema<'AdministerDoseDto'>

export type AdministerDoseResult = Schema<'AdministerDoseResponseDto'>

export type ClinicalExportRow = Schema<'ClinicalExportRowDto'>

export type ClinicalExportPage = Schema<'ClinicalExportPageDto'>

export type ClinicalHistoryEntry = Schema<'ClinicalHistoryEntryDto'>

export type ClinicalHistory = Schema<'ClinicalHistoryResponseDto'>

export type AuditLogEntry = Schema<'AuditLogDto'>

export type LifecycleEventType = Schema<'TherapyLifecycleEventDto'>['type']
export type LifecycleAction = Schema<'TherapyLifecycleDto'>['action']

export type LifecycleRecommendations = Schema<'LifecycleRecommendationsDto'>

export type TherapyLifecycleBody = Schema<'TherapyLifecycleDto'>

export type TherapyLifecycleEvent = Schema<'TherapyLifecycleEventWithAuthorDto'>

export type TherapyLifecycleHistory = Schema<'TherapyLifecycleHistoryDto'>

export type TherapyLifecycleResult = Schema<'TherapyLifecycleResultDto'>

export type RevisePrescriptionBody = Schema<'PrescriptionRevisionDto'>

export type RevisePrescriptionResult =
  | Schema<'PrescriptionRevisionPreviewDto'>
  | Schema<'PrescriptionRevisionAppliedDto'>

export type RetractDoseBody = Schema<'RetractDoseDto'>

export type RetractDoseResult = Schema<'RetractDoseResponseDto'>

export type LateObservationBody = Schema<'LateObservationDto'>

export type DoseObservationAddendum =
  Schema<'DoseObservationAddendumResponseDto'>

export type AppointmentStatus = Schema<'AppointmentResponseDto'>['status']

export type Appointment = Schema<'AppointmentResponseDto'>

export type AppointmentPage = Schema<'AppointmentPageDto'>

export type ScheduleDoseItem = Schema<'ScheduleDoseItemDto'>

export type SchedulePage = Page<ScheduleDoseItem>

export type ClinicalMetrics = Schema<'DoseMetricsResponseDto'>
