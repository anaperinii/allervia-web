import { z } from 'zod'
import {
  nameSchema,
  cpfSchema,
  phoneSchema,
  weightSchema,
  birthdateSchema,
  futureDateSchema,
  extratoSchema,
  concentrationSchema,
  volumeSchema,
} from '@/shared/lib/field-schemas'
import type { FieldPath } from 'react-hook-form'

export const addImmunotherapySchema = z.object({
  name: nameSchema,
  cpf: cpfSchema,
  phone: phoneSchema,
  birthDate: birthdateSchema,
  weight: weightSchema,
  responsibleDoctor: z.string().min(1, 'Médico responsável é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  modality: z.string().min(1, 'Via cutânea é obrigatória'),
  startDate: futureDateSchema,
  extract: extratoSchema,
  targetConcentration: concentrationSchema,
  targetVolume: volumeSchema,
})

export type AddImmunotherapyForm = z.infer<typeof addImmunotherapySchema>

export const STEP_1_FIELDS = [
  'name',
  'cpf',
  'phone',
  'birthDate',
  'weight',
  'responsibleDoctor',
] as const satisfies readonly FieldPath<AddImmunotherapyForm>[]

export const STEP_2_FIELDS = [
  'type',
  'modality',
  'startDate',
  'extract',
  'targetConcentration',
  'targetVolume',
] as const satisfies readonly FieldPath<AddImmunotherapyForm>[]
