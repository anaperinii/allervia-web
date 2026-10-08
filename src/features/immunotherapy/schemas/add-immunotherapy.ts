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
import { calculateAge } from '@/shared/lib/dates'
import type { FieldPath } from 'react-hook-form'

export const ADULT_AGE = 18

export function isMinorBirthDate(birthDate: string): boolean {
  return (
    birthdateSchema.safeParse(birthDate).success &&
    calculateAge(birthDate) < ADULT_AGE
  )
}

export const addImmunotherapySchema = z
  .object({
    name: z.string(),
    cpf: z.string(),
    phone: z.string(),
    birthDate: z.string(),
    weight: z.string(),

    guardianName: z.string(),
    guardianCpf: z.string(),
    guardianPhone: z.string(),

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
    const cpfResult = cpfSchema.safeParse(data.cpf)
    if (!cpfResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cpf'],
        message: cpfResult.error.issues[0].message,
      })
    }

    // Menor de idade: responsável legal obrigatório (nome, CPF e contato).
    if (isMinorBirthDate(data.birthDate)) {
      const guardianNameResult = nameSchema.safeParse(data.guardianName)
      if (!guardianNameResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianName'],
          message: guardianNameResult.error.issues[0].message,
        })
      }
      const guardianCpfResult = cpfSchema.safeParse(data.guardianCpf)
      if (!guardianCpfResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianCpf'],
          message: guardianCpfResult.error.issues[0].message,
        })
      }
      const guardianPhoneResult = phoneSchema.safeParse(data.guardianPhone)
      if (!guardianPhoneResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianPhone'],
          message: guardianPhoneResult.error.issues[0].message,
        })
      }
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
  'name',
  'cpf',
  'phone',
  'birthDate',
  'weight',
  'guardianName',
  'guardianCpf',
  'guardianPhone',
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
