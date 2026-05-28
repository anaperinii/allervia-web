import { z } from 'zod'
import { optionalFutureDateSchema } from '@/shared/lib/field-schemas'

const inactivationCategories = [
  '',
  'treatment_completion',
  'mild_adverse_reaction',
  'severe_adverse_reaction',
  'acute_infection',
  'pregnancy',
  'scheduled_surgery',
  'recent_vaccination',
  'clinical_contraindication',
  'protocol_change',
  'lack_of_adherence',
  'patient_request',
  'other',
] as const

export const inactivateSchema = z
  .object({
    category: z.enum(inactivationCategories),
    otherReason: z.string(),
    detail: z
      .string()
      .min(1, 'Detalhamento é obrigatório')
      .refine((v) => v.trim().length >= 10, 'Detalhamento deve ter ao menos 10 caracteres'),
    expectedReturnDate: optionalFutureDateSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.category) {
      ctx.addIssue({ path: ['category'], code: z.ZodIssueCode.custom, message: 'Selecione a categoria da inativação' })
    }
    if (data.category === 'other' && !data.otherReason.trim()) {
      ctx.addIssue({ path: ['otherReason'], code: z.ZodIssueCode.custom, message: 'Especifique o motivo' })
    }
  })

export type InactivateForm = z.infer<typeof inactivateSchema>

export const INACTIVATE_DEFAULTS: InactivateForm = {
  category: '',
  otherReason: '',
  detail: '',
  expectedReturnDate: '',
}
