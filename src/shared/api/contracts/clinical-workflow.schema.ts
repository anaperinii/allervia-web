import { z } from 'zod'
import { createContractParser } from '@/shared/api/contracts/contract-parser'
import type {
  AdministerDoseResult,
  AppointmentPage,
  ClinicalExportPage,
  DoseDetail,
  DoseRecord,
  ImmunotherapyDetail,
  ImmunotherapyPage,
  PatientDetail,
  PatientPage,
  PreviewDoseResult,
  SchedulePage,
} from '@/shared/api/contracts/clinical'

const count = z.number().int().nonnegative()

const recommendationSchema = z.object({
  kind: z.enum(['RECOMMENDED', 'END_OF_SEQUENCE']),
  fromStepId: z.string().min(1),
})

const doseRecordSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  scheduledAt: z.string().min(1),
})

export const previewDoseResultSchema = z.object({
  recommendation: recommendationSchema,
  allowedValues: z.array(z.object({ id: z.string().min(1) })),
  expectedRevision: count,
  expectedTherapyRevision: count,
})

export const parsePreviewDoseResult = createContractParser<PreviewDoseResult>(
  previewDoseResultSchema,
  'Não foi possível validar a pré-visualização da dose recebida. Tente novamente.',
)

export const administerDoseResultSchema = z.object({
  dose: doseRecordSchema,
  successor: doseRecordSchema.nullable(),
  therapyRevision: count,
})

export const parseAdministerDoseResult =
  createContractParser<AdministerDoseResult>(
    administerDoseResultSchema,
    'Não foi possível validar o resultado da aplicação recebido. Tente novamente.',
  )

export const immunotherapyDetailSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['IN_PROGRESS', 'SUSPENDED', 'COMPLETED']),
  revision: count,
  patient: z.object({
    id: z.string().min(1),
    fullName: z.string().min(1),
    isActive: z.boolean(),
  }),
  prescription: z.record(z.string(), z.unknown()).nullable().optional(),
  nextDose: z
    .object({ id: z.string().min(1), scheduledAt: z.string().min(1) })
    .nullable()
    .optional(),
})

export const parseImmunotherapyDetail =
  createContractParser<ImmunotherapyDetail>(
    immunotherapyDetailSchema,
    'Não foi possível validar o tratamento recebido. Tente novamente.',
  )

export const immunotherapyTypesSchema = z.array(z.string().min(1))

export const parseImmunotherapyTypes = createContractParser<string[]>(
  immunotherapyTypesSchema,
  'Não foi possível validar os tipos de imunoterapia recebidos. Tente novamente.',
)


export const doseRecordsSchema = z.array(
  z.object({
    id: z.string().min(1),
    status: z.enum([
      'SCHEDULED',
      'ADMINISTERED_ON_SCHEDULE',
      'ADMINISTERED_OFF_SCHEDULE',
      'ENTERED_IN_ERROR',
    ]),
    scheduledAt: z.string().min(1),
    administeredAt: z.string().min(1).nullable(),
    isArchived: z.boolean(),
    revision: count,
  }),
)

export const parseDoseRecords = createContractParser<DoseRecord[]>(
  doseRecordsSchema,
  'Não foi possível validar as doses recebidas. Atualize a tela e tente novamente.',
)

export const doseDetailSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  revision: count,
  therapyRevision: count,
  allowedValues: z.array(
    z.object({
      id: z.string().min(1),
      concentration: z.string().min(1),
      volume: z.string().min(1),
    }),
  ),
  immunotherapy: z.object({ id: z.string().min(1) }),
})

export const parseDoseDetail = createContractParser<DoseDetail>(
  doseDetailSchema,
  'Não foi possível validar a dose recebida. Atualize a tela e tente novamente.',
)

export const patientDetailSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  isActive: z.boolean(),
  birthDate: z.string().min(1),
  responsiblePhysician: z.object({
    id: z.string().min(1),
    fullName: z.string().min(1),
  }),
  therapies: z.array(
    z.object({
      id: z.string().min(1),
      status: z.enum(['IN_PROGRESS', 'SUSPENDED', 'COMPLETED']),
      revision: count,
    }),
  ),
})

export const parsePatientDetail = createContractParser<PatientDetail>(
  patientDetailSchema,
  'Não foi possível validar o cadastro recebido. Atualize a tela e tente novamente.',
)


function pageSchema(item: z.ZodType) {
  return z.object({
    items: z.array(item),
    page: count,
    pageSize: count,
    total: count,
  })
}

export const parsePatientPage = createContractParser<PatientPage>(
  pageSchema(z.object({ id: z.string().min(1), fullName: z.string().min(1) })),
  'Não foi possível validar a lista de pacientes recebida. Tente novamente.',
)

export const parseImmunotherapyPage = createContractParser<ImmunotherapyPage>(
  pageSchema(
    z.object({
      id: z.string().min(1),
      status: z.enum(['IN_PROGRESS', 'SUSPENDED', 'COMPLETED']),
      revision: count,
      patient: z.object({ id: z.string().min(1), fullName: z.string().min(1) }),
    }),
  ),
  'Não foi possível validar a lista de tratamentos recebida. Tente novamente.',
)

export const parseAppointmentPage = createContractParser<AppointmentPage>(
  pageSchema(
    z.object({
      id: z.string().min(1),
      status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'MISSED']),
      startsAt: z.string().min(1),
      endsAt: z.string().min(1),
      revision: count,
    }),
  ),
  'Não foi possível validar a agenda recebida. Tente novamente.',
)

export const parseSchedulePage = createContractParser<SchedulePage>(
  pageSchema(
    z.object({
      id: z.string().min(1),
      scheduledAt: z.string().min(1),
      status: z.string().min(1),
    }),
  ),
  'Não foi possível validar as previsões recebidas. Tente novamente.',
)

export const clinicalExportPageSchema = z.object({
  items: z.array(z.object({ doseId: z.string().min(1) })),
  page: count,
  pageSize: count,
  total: count,
  asOf: z.string().min(1),
})

export const parseClinicalExportPage =
  createContractParser<ClinicalExportPage>(
    clinicalExportPageSchema,
    'Não foi possível validar a exportação recebida. Tente novamente.',
  )
