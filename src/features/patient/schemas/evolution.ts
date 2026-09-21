import { z } from 'zod'
import type { FieldPath } from 'react-hook-form'

const yesNo = z.enum(['yes', 'no'])
const conductValues = z.enum([
  '',
  'MAINTAIN',
  'REQUEST_PHYSICIAN_REVIEW',
  'SUSPEND_TREATMENT',
])

/**
 * Evolução sobre o contrato real: o valor administrado é uma etapa permitida
 * pela prescrição (não números livres), o executor é um profissional vinculado
 * e a sucessora é decisão do servidor — o formulário não calcula próxima dose
 * nem intervalo.
 */
export const evolutionSchema = z
  .object({
    // Pré-aplicação (observação PRE_ADMINISTRATION + relato do intervalo)
    intervalReport: z.string().min(1, 'Relato do intervalo é obrigatório'),
    sideEffect: yesNo,
    reportedEffects: z.string(),
    medicationNeeded: yesNo,
    medications: z.string(),
    notesPre: z.string(),

    // Pós-aplicação
    applicationDate: z.string().min(1, 'Data é obrigatória'),
    startTime: z.string().min(1, 'Hora de início é obrigatória'),
    endTime: z.string(),
    stepId: z.string().min(1, 'Selecione o valor aplicado'),
    adjustmentReason: z.string(),
    performerId: z.string().min(1, 'Selecione o executor da aplicação'),
    sideEffectPost: yesNo,
    reportedEffectsPost: z.string(),
    medicationNeededPost: yesNo,
    medicationsPost: z.string(),
    notesPost: z.string(),
    conduct: conductValues,
    conductJustification: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.sideEffect === 'yes' && !data.reportedEffects.trim()) {
      ctx.addIssue({
        path: ['reportedEffects'],
        code: z.ZodIssueCode.custom,
        message: 'Descreva os efeitos colaterais',
      })
    }
    if (data.medicationNeeded === 'yes' && !data.medications.trim()) {
      ctx.addIssue({
        path: ['medications'],
        code: z.ZodIssueCode.custom,
        message: 'Informe as medicações administradas',
      })
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      ctx.addIssue({
        path: ['endTime'],
        code: z.ZodIssueCode.custom,
        message: 'Hora fim deve ser após início',
      })
    }

    if (data.sideEffectPost === 'yes' && !data.reportedEffectsPost.trim()) {
      ctx.addIssue({
        path: ['reportedEffectsPost'],
        code: z.ZodIssueCode.custom,
        message: 'Descreva os efeitos colaterais',
      })
    }
    if (data.medicationNeededPost === 'yes' && !data.medicationsPost.trim()) {
      ctx.addIssue({
        path: ['medicationsPost'],
        code: z.ZodIssueCode.custom,
        message: 'Informe as medicações',
      })
    }
    if (
      data.sideEffectPost === 'yes' &&
      data.medicationNeededPost === 'yes' &&
      !data.conduct
    ) {
      ctx.addIssue({
        path: ['conduct'],
        code: z.ZodIssueCode.custom,
        message: 'Selecione a conduta imediata',
      })
    }
    if (data.conduct && !data.conductJustification.trim()) {
      ctx.addIssue({
        path: ['conductJustification'],
        code: z.ZodIssueCode.custom,
        message: 'Justifique a conduta escolhida',
      })
    }
  })

export type EvolutionForm = z.infer<typeof evolutionSchema>

export const STEP_1_FIELDS = [
  'intervalReport',
  'sideEffect',
  'reportedEffects',
  'medicationNeeded',
  'medications',
  'notesPre',
] as const satisfies readonly FieldPath<EvolutionForm>[]

export const STEP_2_FIELDS = [
  'applicationDate',
  'startTime',
  'endTime',
  'stepId',
  'adjustmentReason',
  'performerId',
  'sideEffectPost',
  'reportedEffectsPost',
  'medicationNeededPost',
  'medicationsPost',
  'notesPost',
  'conduct',
  'conductJustification',
] as const satisfies readonly FieldPath<EvolutionForm>[]

export const EVOLUTION_DEFAULTS: EvolutionForm = {
  intervalReport: '',
  sideEffect: 'no',
  reportedEffects: '',
  medicationNeeded: 'no',
  medications: '',
  notesPre: '',
  applicationDate: '',
  startTime: '',
  endTime: '',
  stepId: '',
  adjustmentReason: '',
  performerId: '',
  sideEffectPost: 'no',
  reportedEffectsPost: '',
  medicationNeededPost: 'no',
  medicationsPost: '',
  notesPost: '',
  conduct: '',
  conductJustification: '',
}
