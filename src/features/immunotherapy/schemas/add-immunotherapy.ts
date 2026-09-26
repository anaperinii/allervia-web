import { z } from 'zod'
import {
  nameSchema,
  cpfSchema,
  phoneSchema,
  weightSchema,
  birthdateSchema,
  futureDateSchema,
  extratoSchema,
} from '@/shared/lib/field-schemas'
import type { FieldPath } from 'react-hook-form'

export const addImmunotherapySchema = z
  .object({
    patientMode: z.enum(['new', 'existing']),

    name: z.string(),
    cpf: z.string(),
    phone: z.string(),
    birthDate: z.string(),
    weight: z.string(),

    patientId: z.string(),

    type: z.string().min(1, 'Tipo é obrigatório'),
    startDate: futureDateSchema,
    extract: extratoSchema,

    protocolVersionId: z.string().min(1, 'Selecione a versão do protocolo'),
    stepIds: z.array(z.string()).min(1, 'Selecione ao menos uma etapa'),
    startingStepId: z.string().min(1, 'Selecione a etapa inicial'),
    targetStepId: z.string().min(1, 'Selecione a etapa meta'),
  })
  .superRefine((data, ctx) => {
    if (data.patientMode === 'new') {
      const nameResult = nameSchema.safeParse(data.name)
      if (!nameResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['name'],
          message: nameResult.error.issues[0].message,
        })
      }
      const phoneResult = phoneSchema.safeParse(data.phone)
      if (!phoneResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phone'],
          message: phoneResult.error.issues[0].message,
        })
      }
      const birthResult = birthdateSchema.safeParse(data.birthDate)
      if (!birthResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthDate'],
          message: birthResult.error.issues[0].message,
        })
      }
      const weightResult = weightSchema.safeParse(data.weight)
      if (!weightResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['weight'],
          message: weightResult.error.issues[0].message,
        })
      }
      if (data.cpf.trim().length > 0) {
        const cpfResult = cpfSchema.safeParse(data.cpf)
        if (!cpfResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['cpf'],
            message: cpfResult.error.issues[0].message,
          })
        }
      }
    } else if (!data.patientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientId'],
        message: 'Selecione o paciente',
      })
    }

    if (data.stepIds.length > 0) {
      if (!data.stepIds.includes(data.startingStepId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startingStepId'],
          message: 'A etapa inicial precisa estar entre as selecionadas',
        })
      }
      if (!data.stepIds.includes(data.targetStepId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['targetStepId'],
          message: 'A etapa meta precisa estar entre as selecionadas',
        })
      }
    }
  })

export type AddImmunotherapyForm = z.infer<typeof addImmunotherapySchema>

export const STEP_1_FIELDS = [
  'patientMode',
  'name',
  'cpf',
  'phone',
  'birthDate',
  'weight',
  'patientId',
] as const satisfies readonly FieldPath<AddImmunotherapyForm>[]

export const STEP_2_FIELDS = [
  'type',
  'startDate',
  'extract',
  'protocolVersionId',
  'stepIds',
  'startingStepId',
  'targetStepId',
] as const satisfies readonly FieldPath<AddImmunotherapyForm>[]
