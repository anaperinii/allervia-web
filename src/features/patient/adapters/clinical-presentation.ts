import type {
  AdministrationRoute,
  DoseRecord,
  ImmunotherapyListItem,
  PatientDetail,
  ScheduleDoseItem,
  TherapyStatus,
  TherapySummary,
} from '@/shared/api/contracts/clinical'
import type { Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import type { Application, Patient } from '@/features/patient/stores/usePatientStore'
import { MONTHS_PT_UPPER } from '@/shared/constants/months-pt'

export const ROUTE_LABELS: Record<AdministrationRoute, string> = {
  SUBCUTANEOUS: 'Subcutânea',
  SUBLINGUAL: 'Sublingual',
}

export const THERAPY_STATUS_LABELS: Record<TherapyStatus, string> = {
  IN_PROGRESS: 'Em andamento',
  SUSPENDED: 'Suspenso',
  COMPLETED: 'Concluído',
}

export function routeToLegacyModality(
  route: AdministrationRoute,
): Immunotherapy['modality'] {
  return route === 'SUBCUTANEOUS' ? 'subcutaneous' : 'sublingual'
}

export function legacyModalityToRoute(
  modality: Immunotherapy['modality'],
): AdministrationRoute {
  return modality === 'subcutaneous' ? 'SUBCUTANEOUS' : 'SUBLINGUAL'
}

export function therapyStatusToLegacy(
  status: TherapyStatus,
): Immunotherapy['status'] {
  if (status === 'IN_PROGRESS') return 'active'
  if (status === 'COMPLETED') return 'completed'
  return 'inactive'
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export function formatCivilDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

export function formatInstantDate(iso: string, timeZone = 'America/Sao_Paulo'): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone }).format(new Date(iso))
}

export function ageFromBirthDate(iso: string): number {
  const birth = new Date(iso)
  const now = new Date()
  let age = now.getUTCFullYear() - birth.getUTCFullYear()
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1
  }
  return age
}

interface ResolvedStep {
  id: string
  label?: string
  concentration: string
  volume: string
  intervalDays: number
}

interface ResolvedPrescription {
  steps?: ResolvedStep[]
  startingStepId?: string
  targetStepId?: string
}

export function formatStepPresentation(step: {
  concentration: string
  volume: string
}): string {
  const concentration = Number(step.concentration).toLocaleString('pt-BR')
  const volume = step.volume.replace('.', ',')
  return `1:${concentration} - ${volume}ml`
}

const normalizeStepText = (value: string) =>
  value.toLowerCase().replace(/[^0-9a-z:]/g, '')

export function formatStepOption(step: {
  label: string
  concentration: string
  volume: string
}): string {
  const presentation = formatStepPresentation(step)
  const label = step.label.trim()
  if (!label || normalizeStepText(label) === normalizeStepText(presentation)) {
    return presentation
  }
  return `${label} — ${presentation}`
}

export function readResolvedPrescription(
  resolved: unknown,
): ResolvedPrescription | null {
  if (!resolved || typeof resolved !== 'object') return null
  return resolved as ResolvedPrescription
}

export function buildLegacyPatient(
  detail: PatientDetail,
  therapy: TherapySummary | null,
  timeZone = 'America/Sao_Paulo',
): Patient {
  return {
    id: detail.id,
    name: detail.fullName,
    birthDate: formatCivilDate(detail.birthDate),
    age: ageFromBirthDate(detail.birthDate),
    phone: detail.phoneNumber,
    weight: `${detail.weightInKg.toLocaleString('pt-BR')} kg`,
    cpf: detail.cpf ?? detail.cpfMasked ?? '—',
    guardian: detail.guardian
      ? {
          name: detail.guardian.fullName,
          cpf: detail.guardian.cpf ?? '',
          phone: detail.guardian.phoneNumber,
        }
      : null,
    responsibleDoctor: detail.responsiblePhysician.fullName,
    responsibleDoctorId: detail.responsiblePhysician.id,
    status: detail.isActive ? 'active' : 'inactive',
    immunotherapyType: therapy?.immunoType ?? '—',
    administrationRoute: therapy
      ? ROUTE_LABELS[therapy.administrationRoute]
      : '—',
    extract: therapy?.extract ?? '—',
    targetConcentrationVolume: '',
    targetReached: therapy?.status === 'COMPLETED',
    currentInterval: 0,
    nextApplicationDate: therapy?.nextDose
      ? formatInstantDate(therapy.nextDose.scheduledAt, timeZone)
      : '',
    currentDoseConcentration: '',
  }
}

function localTime(iso: string, timeZone = 'America/Sao_Paulo'): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function localPtDate(iso: string, timeZone = 'America/Sao_Paulo'): string {
  return formatInstantDate(iso, timeZone)
}

type LegacyApplicationSource = Pick<
  DoseRecord,
  | 'id'
  | 'administeredAt'
  | 'scheduledAt'
  | 'administeredValues'
  | 'plannedValues'
  | 'administrationEndedAt'
  | 'timeZone'
>

export function doseToLegacyApplication(
  record: LegacyApplicationSource,
  patientId: string,
  observations?: { hasReaction: boolean; timeZone?: string },
): Application {
  const timeZone = record.timeZone ?? observations?.timeZone ?? 'America/Sao_Paulo'
  const isAdministered = record.administeredAt !== null
  const instantIso = record.administeredAt ?? record.scheduledAt
  const instant = new Date(instantIso)
  const values = isAdministered
    ? (record.administeredValues ?? record.plannedValues)
    : record.plannedValues
  return {
    id: record.id,
    patientId,
    timeZone,
    date: localPtDate(instantIso, timeZone),
    startTime: localTime(instantIso, timeZone),
    endTime: record.administrationEndedAt
      ? localTime(record.administrationEndedAt, timeZone)
      : '',
    status: isAdministered ? 'completed' : 'scheduled',
    dose: values ? formatStepPresentation(values) : '—',
    cycle: { number: 1, days: values?.intervalDays ?? 0 },
    month: MONTHS_PT_UPPER[Number(new Intl.DateTimeFormat('en', { timeZone: timeZone, month: 'numeric' }).format(instant)) - 1],
    year: Number(new Intl.DateTimeFormat('en', { timeZone: timeZone, year: 'numeric' }).format(instant)),
    appliedVolume: values ? `${values.volume.replace('.', ',')}ml` : undefined,
    extractConcentration: values
      ? `1:${Number(values.concentration).toLocaleString('pt-BR')}`
      : undefined,
    sideEffect: observations?.hasReaction ? 'yes' : undefined,
  }
}

export function scheduleItemToApplication(
  item: ScheduleDoseItem,
  timeZone = 'America/Sao_Paulo',
): Application {
  const base = doseToLegacyApplication(item, item.immunotherapy.patient.id, { hasReaction: false, timeZone })
  return {
    ...base,
    patientName: item.immunotherapy.patient.fullName,
    patientPhone: item.immunotherapy.patient.phoneNumber,
    administrator: item.immunotherapy.patient.responsiblePhysician.fullName,
    modality: 'subcutaneous',
  }
}

export function buildLegacyListItem(
  item: ImmunotherapyListItem,
): Immunotherapy {
  return {
    id: item.id,
    name: item.patient.fullName,
    phone: '',
    type: item.immunoType,
    doseConcentration: '',
    cycleInterval: { number: 1, days: 0 },
    modality: routeToLegacyModality(item.administrationRoute),
    status: therapyStatusToLegacy(item.status),
    responsibleDoctor: item.responsiblePhysician.fullName,
  }
}
