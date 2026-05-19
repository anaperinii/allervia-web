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
  nome: nameSchema,
  cpf: cpfSchema,
  telefone: phoneSchema,
  dataNascimento: birthdateSchema,
  peso: weightSchema,
  medicoResponsavel: z.string().min(1, 'Médico responsável é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  viaCutanea: z.string().min(1, 'Via cutânea é obrigatória'),
  dataInicio: futureDateSchema,
  extrato: extratoSchema,
  metaConcentracao: concentrationSchema,
  metaVolume: volumeSchema,
})

export type AddImmunotherapyForm = z.infer<typeof addImmunotherapySchema>

export const STEP_1_FIELDS = [
  'nome',
  'cpf',
  'telefone',
  'dataNascimento',
  'peso',
  'medicoResponsavel',
] as const satisfies readonly FieldPath<AddImmunotherapyForm>[]

export const STEP_2_FIELDS = [
  'tipo',
  'viaCutanea',
  'dataInicio',
  'extrato',
  'metaConcentracao',
  'metaVolume',
] as const satisfies readonly FieldPath<AddImmunotherapyForm>[]
