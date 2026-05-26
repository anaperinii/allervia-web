import { z } from 'zod'

export interface ReactivateContext {
  suggestedConcentration: string
  snapshotInterval: number
}

export function createReactivateSchema({ suggestedConcentration, snapshotInterval }: ReactivateContext) {
  return z
    .object({
      concentration: z.string().min(1, 'Informe a concentração/volume'),
      interval: z.string(),
      justification: z.string(),
      note: z.string(),
    })
    .superRefine((data, ctx) => {
      const intervalStr = data.interval.trim()
      if (!intervalStr) {
        ctx.addIssue({ path: ['interval'], code: z.ZodIssueCode.custom, message: 'Selecione o intervalo' })
      } else if (!/^\d+$/.test(intervalStr)) {
        ctx.addIssue({ path: ['interval'], code: z.ZodIssueCode.custom, message: 'Informe um número válido de dias' })
      }

      const diverges =
        data.concentration.trim() !== suggestedConcentration.trim() ||
        intervalStr !== String(snapshotInterval)

      if (diverges) {
        const just = data.justification.trim()
        if (!just) {
          ctx.addIssue({
            path: ['justification'],
            code: z.ZodIssueCode.custom,
            message: 'Justifique o ajuste do ponto de retomada',
          })
        } else if (just.length < 10) {
          ctx.addIssue({
            path: ['justification'],
            code: z.ZodIssueCode.custom,
            message: 'Justificativa deve ter ao menos 10 caracteres',
          })
        }
      }
    })
}

export type ReactivateForm = {
  concentration: string
  interval: string
  justification: string
  note: string
}

export const REACTIVATE_DEFAULTS: ReactivateForm = {
  concentration: '',
  interval: '',
  justification: '',
  note: '',
}
