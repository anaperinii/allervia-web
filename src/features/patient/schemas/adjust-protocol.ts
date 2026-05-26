import { z } from 'zod'
import type { ProtocolAdjustmentType } from '@/features/patient/stores/usePatientStore'

const adjustmentTypes = ['', 'dose_reduction', 'interval_increase', 'concentration_change', 'suspension', 'other'] as const

export const adjustProtocolSchema = z
  .object({
    type: z.enum(adjustmentTypes),
    otherReason: z.string(),
    newConcentration: z.string().min(1, 'Informe a nova concentração'),
    newInterval: z.string(),
    newType: z.string(),
    newRoute: z.string(),
    newExtract: z.string(),
    justification: z
      .string()
      .min(1, 'Justificativa é obrigatória')
      .refine((v) => v.trim().length >= 10, 'Justificativa deve ter ao menos 10 caracteres'),
  })
  .superRefine((data, ctx) => {
    if (!data.type) {
      ctx.addIssue({ path: ['type'], code: z.ZodIssueCode.custom, message: 'Selecione o tipo de ajuste' })
    }
    if (data.type === 'other' && !data.otherReason.trim()) {
      ctx.addIssue({ path: ['otherReason'], code: z.ZodIssueCode.custom, message: 'Especifique o motivo' })
    }
    const interval = data.newInterval.trim()
    if (!interval) {
      ctx.addIssue({ path: ['newInterval'], code: z.ZodIssueCode.custom, message: 'Selecione o novo intervalo' })
    } else if (!/^\d+$/.test(interval)) {
      ctx.addIssue({ path: ['newInterval'], code: z.ZodIssueCode.custom, message: 'Informe um número válido de dias' })
    }
  })

export type AdjustProtocolForm = z.infer<typeof adjustProtocolSchema>

export const ADJUST_PROTOCOL_DEFAULTS: AdjustProtocolForm = {
  type: '' as ProtocolAdjustmentType | '',
  otherReason: '',
  newConcentration: '',
  newInterval: '',
  newType: '',
  newRoute: '',
  newExtract: '',
  justification: '',
}
