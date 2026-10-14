import type {
  DoseDetail,
  DoseRecord,
  DoseValues,
  ImmunotherapyListItem,
  ImmunotherapyPage,
  PatientDetail,
  TherapySummary,
} from '@/shared/api/contracts/clinical'
import type { Schema } from '@/shared/api/generated/helpers'







export const ORGANIZATION_ID = 'organization-1'
export const PHYSICIAN_ID = 'professional-1'
export const USER_ID = 'user-1'

function values(overrides: Partial<DoseValues> = {}): DoseValues {
  return {
    concentration: '1000',
    concentrationUnit: 'DILUTION_DENOMINATOR',
    intervalDays: 7,
    phase: 'BUILD_UP',
    route: 'SUBCUTANEOUS',
    volume: '0.1',
    volumeUnit: 'mL',
    ...overrides,
  }
}

export const doseValues = values

export function protocolStep(
  overrides: Partial<Schema<'ProtocolStepResponseDto'>> = {},
): Schema<'ProtocolStepResponseDto'> {
  return {
    concentration: '1000',
    id: 'low',
    intervalDays: 7,
    label: 'Etapa inicial',
    nextStepId: 'high',
    phase: 'BUILD_UP',
    volume: '0.1',
    ...overrides,
  }
}

export function doseRecord(overrides: Partial<DoseRecord> = {}): DoseRecord {
  return {
    administeredAt: null,
    administeredById: null,
    administeredStepId: null,
    administeredValues: null,
    administrationEndedAt: null,
    archivedAt: null,
    archivedById: null,
    betweenDosesReport: '',
    concentration: 1000,
    createdAt: '2026-01-01T13:00:00.000Z',
    createdById: USER_ID,
    id: 'dose-1',
    immediateConduct: null,
    immediateConductJustification: null,
    immunotherapyId: 'therapy-1',
    isArchived: false,
    nextIntervalInDays: 7,
    plannedStepId: 'low',
    plannedValues: values(),
    prescriptionId: 'prescription-1',
    recommendation: null,
    revision: 0,
    scheduledAt: '2026-01-08T13:00:00.000Z',
    sourceDoseId: null,
    status: 'SCHEDULED',
    updatedAt: '2026-01-01T13:00:00.000Z',
    updatedById: USER_ID,
    volume: '0.1',
    ...overrides,
  }
}


export function administeredDose(overrides: Partial<DoseRecord> = {}): DoseRecord {
  return doseRecord({
    id: 'dose-administered',
    status: 'ADMINISTERED_ON_SCHEDULE',
    administeredAt: '2026-01-01T13:00:00.000Z',
    administeredById: USER_ID,
    administeredStepId: 'low',
    administeredValues: values(),
    administrationEndedAt: '2026-01-01T13:30:00.000Z',
    scheduledAt: '2026-01-01T13:00:00.000Z',
    ...overrides,
  })
}

export function doseTherapy(
  overrides: Partial<Schema<'DoseTherapyDto'>> = {},
): Schema<'DoseTherapyDto'> {
  return {
    administrationRoute: 'SUBCUTANEOUS',
    archivedAt: null,
    archivedById: null,
    createdAt: '2026-01-01T13:00:00.000Z',
    createdById: USER_ID,
    currentPrescription: null,
    currentPrescriptionId: 'prescription-1',
    extract: 'Der p 100%',
    id: 'therapy-1',
    immunoType: 'SCIT',
    inductionStartDate: '2026-01-01T13:00:00.000Z',
    isArchived: false,
    maintenanceStartDate: null,
    patientId: 'patient-1',
    revision: 0,
    status: 'IN_PROGRESS',
    targetConcentration: 100,
    targetVolume: '0.3',
    updatedAt: '2026-01-01T13:00:00.000Z',
    updatedById: USER_ID,
    ...overrides,
  }
}

export function doseDetail(overrides: Partial<DoseDetail> = {}): DoseDetail {
  const record = doseRecord()
  return {
    ...record,
    allowedValues: [
      protocolStep(),
      protocolStep({ id: 'high', label: 'Etapa alvo', nextStepId: null, concentration: '100', volume: '0.3' }),
    ],
    immunotherapy: doseTherapy(),
    migrationRequired: false,
    observationAddenda: [],
    observations: [],
    prescriptionRevision: 1,
    protocolVersionId: 'version-1',
    therapyRevision: 0,
    ...overrides,
  }
}

export function therapySummary(overrides: Partial<TherapySummary> = {}): TherapySummary {
  return {
    administrationRoute: 'SUBCUTANEOUS',
    createdAt: '2026-01-01T13:00:00.000Z',
    extract: 'Der p 100%',
    id: 'therapy-1',
    immunoType: 'SCIT',
    inductionStartDate: '2026-01-01T13:00:00.000Z',
    maintenanceStartDate: null,
    nextDose: {
      id: 'dose-1',
      scheduledAt: '2026-01-08T13:00:00.000Z',
      status: 'SCHEDULED',
    },
    prescription: { versionId: 'version-1', revision: 1 },
    revision: 0,
    status: 'IN_PROGRESS',
    ...overrides,
  }
}

export function patientDetail(overrides: Partial<PatientDetail> = {}): PatientDetail {
  return {
    birthDate: '1990-06-15T00:00:00.000Z',
    cpf: '52998224725',
    cpfMasked: '***.***.*47-25',
    createdAt: '2026-01-01T13:00:00.000Z',
    fullName: 'Carla Mendes',
    guardian: null,
    id: 'patient-1',
    isActive: true,
    phoneNumber: '62999999999',
    responsiblePhysician: {
      councilNumber: '24815',
      councilUf: 'GO',
      fullName: 'Dra. Karina Martins',
      id: PHYSICIAN_ID,
    },
    therapies: [therapySummary()],
    therapyCount: 1,
    therapyStatuses: ['IN_PROGRESS'],
    updatedAt: '2026-01-01T13:00:00.000Z',
    weightInKg: 70.5,
    ...overrides,
  }
}

export function immunotherapyListItem(
  overrides: Partial<ImmunotherapyListItem> = {},
): ImmunotherapyListItem {
  return {
    administrationRoute: 'SUBCUTANEOUS',
    createdAt: '2026-01-01T13:00:00.000Z',
    currentPhase: 'BUILD_UP',
    extract: 'Der p 100%',
    id: 'therapy-1',
    immunoType: 'SCIT',
    inductionStartDate: '2026-01-01T13:00:00.000Z',
    maintenanceStartDate: null,
    nextDose: {
      id: 'dose-1',
      intervalDays: 7,
      phase: 'BUILD_UP',
      scheduledAt: '2026-01-08T13:00:00.000Z',
      status: 'SCHEDULED',
    },
    patient: { id: 'patient-1', fullName: 'Carla Mendes', isActive: true },
    prescription: { versionId: 'version-1', revision: 1 },
    responsiblePhysician: { id: PHYSICIAN_ID, fullName: 'Dra. Karina Martins' },
    revision: 0,
    status: 'IN_PROGRESS',
    ...overrides,
  }
}

export function immunotherapyPage(
  items: ImmunotherapyListItem[] = [immunotherapyListItem()],
  overrides: Partial<ImmunotherapyPage> = {},
): ImmunotherapyPage {
  return {
    items,
    page: 1,
    pageSize: 10,
    total: items.length,
    ...overrides,
  }
}

export function professional(
  overrides: Partial<Schema<'ProfessionalResponseDto'>> = {},
): Schema<'ProfessionalResponseDto'> {
  return {
    councilNumber: '24815',
    councilUf: 'GO',
    createdAt: '2026-01-01T13:00:00.000Z',
    fullName: 'Dra. Karina Martins',
    id: PHYSICIAN_ID,
    organizationId: ORGANIZATION_ID,
    phoneNumber: '62995571423',
    profession: 'PHYSICIAN',
    updatedAt: '2026-01-01T13:00:00.000Z',
    userId: USER_ID,
    ...overrides,
  }
}

export function professionalPage(
  items: Schema<'ProfessionalResponseDto'>[] = [professional()],
): {
  items: Schema<'ProfessionalResponseDto'>[]
  page: number
  pageSize: number
  total: number
} {
  return { items, page: 1, pageSize: 100, total: items.length }
}
