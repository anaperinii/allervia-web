import { z } from 'zod'

const inactivationCategories = [
  '',
  'conclusao_tratamento',
  'reacao_adversa_leve',
  'reacao_adversa_grave',
  'infeccao_aguda',
  'gestacao',
  'cirurgia_programada',
  'vacinacao_recente',
  'contraindicacao_clinica',
  'mudanca_conduta',
  'falta_adesao',
  'solicitacao_paciente',
  'outro',
] as const

export const inactivateSchema = z
  .object({
    category: z.enum(inactivationCategories),
    outroMotivo: z.string(),
    detail: z
      .string()
      .min(1, 'Detalhamento é obrigatório')
      .refine((v) => v.trim().length >= 10, 'Detalhamento deve ter ao menos 10 caracteres'),
    expectedReturnDate: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.category) {
      ctx.addIssue({ path: ['category'], code: z.ZodIssueCode.custom, message: 'Selecione a categoria da inativação' })
    }
    if (data.category === 'outro' && !data.outroMotivo.trim()) {
      ctx.addIssue({ path: ['outroMotivo'], code: z.ZodIssueCode.custom, message: 'Especifique o motivo' })
    }
  })

export type InactivateForm = z.infer<typeof inactivateSchema>

export const INACTIVATE_DEFAULTS: InactivateForm = {
  category: '',
  outroMotivo: '',
  detail: '',
  expectedReturnDate: '',
}
