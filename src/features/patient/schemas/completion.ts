import { z } from 'zod'

export const completionSchema = z.object({
  recommendRetesting: z.boolean(),
  maintainRescueMed: z.boolean(),
  environmentalControl: z.boolean(),
  customRecommendations: z.array(z.string()),
  monitoringSchedule: z.string(),
  warningSigns: z.string(),
  note: z.string(),
  confirmation: z.boolean().refine((v) => v === true, 'Você precisa confirmar para finalizar.'),
})

export type CompletionForm = z.infer<typeof completionSchema>

export const COMPLETION_DEFAULTS: CompletionForm = {
  recommendRetesting: true,
  maintainRescueMed: true,
  environmentalControl: true,
  customRecommendations: [],
  monitoringSchedule: '',
  warningSigns: '',
  note: '',
  confirmation: false,
}
