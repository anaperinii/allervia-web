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

export function formatInstantDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(iso))
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

export function readResolvedPrescription(
  resolved: unknown,
): ResolvedPrescription | null {
  if (!resolved || typeof resolved !== 'object') return null
  return resolved as ResolvedPrescription
}

export function buildLegacyPatient(
  detail: PatientDetail,
  therapy: TherapySummary | null,
): Patient {
  return {
    id: detail.id,
    name: detail.fullName,
    birthDate: formatCivilDate(detail.birthDate),
    age: ageFromBirthDate(detail.birthDate),
    phone: detail.phoneNumber,
    weight: `${detail.weightInKg.toLocaleString('pt-BR')} kg`,
    cpf: detail.cpf ?? detail.cpfMasked ?? '—',
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
      ? formatInstantDate(therapy.nextDose.scheduledAt)
      : '',
    currentDoseConcentration: '',
  }
}

function localTime(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function localPtDate(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

export function doseToLegacyApplication(
  record: DoseRecord,
  patientId: string,
  observations?: { hasReaction: boolean },
): Application {
  const isAdministered = record.administeredAt !== null
  const instantIso = record.administeredAt ?? record.scheduledAt
  const instant = new Date(instantIso)
  const values = isAdministered
    ? (record.administeredValues ?? record.plannedValues)
    : record.plannedValues
  return {
    id: record.id,
    patientId,
    date: localPtDate(instantIso),
    startTime: localTime(instantIso),
    endTime: record.administrationEndedAt
      ? localTime(record.administrationEndedAt)
      : '',
    status: isAdministered ? 'completed' : 'scheduled',
    dose: values ? formatStepPresentation(values) : '—',
    cycle: { number: 1, days: values?.intervalDays ?? 0 },
    month: MONTHS_PT_UPPER[instant.getMonth()],
    year: instant.getFullYear(),
    appliedVolume: values ? `${values.volume.replace('.', ',')}ml` : undefined,
    extractConcentration: values
      ? `1:${Number(values.concentration).toLocaleString('pt-BR')}`
      : undefined,
    sideEffect: observations?.hasReaction ? 'yes' : undefined,
  }
}

export function scheduleItemToApplication(
  item: ScheduleDoseItem,
): Application {
  const base = doseToLegacyApplication(
    {
      ...item,
      immediateConduct: null,
      immediateConductJustification: null,
      administeredById: null,
      betweenDosesReport: '',
      recommendation: null,
      sourceDoseId: null,
      isArchived: false,
      createdAt: item.scheduledAt,
      updatedAt: item.scheduledAt,
    },
    item.immunotherapy.patient.id,
  )
  return {
    ...base,
    patientName: item.immunotherapy.patient.fullName,
    patientPhone: item.immunotherapy.patient.phoneNumber,
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
