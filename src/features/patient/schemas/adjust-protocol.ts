import { z } from 'zod'
import type { ProtocolAdjustmentType } from '@/features/patient/stores/patient-store'

const adjustmentTypes = ['', 'reducao_dose', 'aumento_intervalo', 'alteracao_concentracao', 'suspensao', 'outro'] as const

export const adjustProtocolSchema = z
  .object({
    type: z.enum(adjustmentTypes),
    outroMotivo: z.string(),
    newConcentracao: z.string().min(1, 'Informe a nova concentração'),
    newIntervalo: z.string(),
    newTipo: z.string(),
    newVia: z.string(),
    newExtrato: z.string(),
    justificativa: z
      .string()
      .min(1, 'Justificativa é obrigatória')
      .refine((v) => v.trim().length >= 10, 'Justificativa deve ter ao menos 10 caracteres'),
  })
  .superRefine((data, ctx) => {
    if (!data.type) {
      ctx.addIssue({ path: ['type'], code: z.ZodIssueCode.custom, message: 'Selecione o tipo de ajuste' })
    }
    if (data.type === 'outro' && !data.outroMotivo.trim()) {
      ctx.addIssue({ path: ['outroMotivo'], code: z.ZodIssueCode.custom, message: 'Especifique o motivo' })
    }
    const intervalo = data.newIntervalo.trim()
    if (!intervalo) {
      ctx.addIssue({ path: ['newIntervalo'], code: z.ZodIssueCode.custom, message: 'Selecione o novo intervalo' })
    } else if (!/^\d+$/.test(intervalo)) {
      ctx.addIssue({ path: ['newIntervalo'], code: z.ZodIssueCode.custom, message: 'Informe um número válido de dias' })
    }
  })

export type AdjustProtocolForm = z.infer<typeof adjustProtocolSchema>

export const ADJUST_PROTOCOL_DEFAULTS: AdjustProtocolForm = {
  type: '' as ProtocolAdjustmentType | '',
  outroMotivo: '',
  newConcentracao: '',
  newIntervalo: '',
  newTipo: '',
  newVia: '',
  newExtrato: '',
  justificativa: '',
}
