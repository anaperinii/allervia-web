import { z } from 'zod'

export interface ReactivateContext {
  suggestedConcentracao: string
  snapshotIntervalo: number
}

export function createReactivateSchema({ suggestedConcentracao, snapshotIntervalo }: ReactivateContext) {
  return z
    .object({
      concentracao: z.string().min(1, 'Informe a concentração/volume'),
      intervalo: z.string(),
      justificativa: z.string(),
      note: z.string(),
    })
    .superRefine((data, ctx) => {
      const intervaloStr = data.intervalo.trim()
      if (!intervaloStr) {
        ctx.addIssue({ path: ['intervalo'], code: z.ZodIssueCode.custom, message: 'Selecione o intervalo' })
      } else if (!/^\d+$/.test(intervaloStr)) {
        ctx.addIssue({ path: ['intervalo'], code: z.ZodIssueCode.custom, message: 'Informe um número válido de dias' })
      }

      const diverges =
        data.concentracao.trim() !== suggestedConcentracao.trim() ||
        intervaloStr !== String(snapshotIntervalo)

      if (diverges) {
        const just = data.justificativa.trim()
        if (!just) {
          ctx.addIssue({
            path: ['justificativa'],
            code: z.ZodIssueCode.custom,
            message: 'Justifique o ajuste do ponto de retomada',
          })
        } else if (just.length < 10) {
          ctx.addIssue({
            path: ['justificativa'],
            code: z.ZodIssueCode.custom,
            message: 'Justificativa deve ter ao menos 10 caracteres',
          })
        }
      }
    })
}

export type ReactivateForm = {
  concentracao: string
  intervalo: string
  justificativa: string
  note: string
}

export const REACTIVATE_DEFAULTS: ReactivateForm = {
  concentracao: '',
  intervalo: '',
  justificativa: '',
  note: '',
}
