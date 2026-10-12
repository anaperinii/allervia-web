import { z } from 'zod'
import { createContractParser } from '@/shared/api/contracts/contract-parser'
import type {
  AdministerDoseResult,
  ClinicalExportPage,
  ImmunotherapyDetail,
  PreviewDoseResult,
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
