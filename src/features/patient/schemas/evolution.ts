import { z } from 'zod'
import type { FieldPath } from 'react-hook-form'

const yesNo = z.enum(['yes', 'no'])
const conductValues = z.enum([
  '',
  'MAINTAIN',
  'REQUEST_PHYSICIAN_REVIEW',
  'SUSPEND_TREATMENT',
])

export const evolutionSchema = z
  .object({
    intervalReport: z.string().min(1, 'Relato do intervalo é obrigatório'),
    sideEffect: yesNo,
    reportedEffects: z.string(),
    medicationNeeded: yesNo,
    medications: z.string(),
    notesPre: z.string(),

    applicationDate: z.string().min(1, 'Data é obrigatória'),
    startTime: z.string().min(1, 'Hora de início é obrigatória'),
    endTime: z.string(),
    nextApplicationDate: z.string(),
    nextApplicationDatePlanned: z.string(),
    nextIntervalBand: z.enum([
      '',
      'TOO_SHORT',
      'ON_PLAN',
      'LONG',
      'REQUIRES_STEP_REVIEW',
    ]),
    nextScheduleReason: z.string(),
    nextScheduleReview: z.enum(['', 'KEEP_STEP', 'STEP_BACK_REQUESTED']),
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

    if (
      data.nextApplicationDate &&
      data.applicationDate &&
      data.nextApplicationDate <= data.applicationDate
    ) {
      ctx.addIssue({
        path: ['nextApplicationDate'],
        code: z.ZodIssueCode.custom,
        message: 'A próxima aplicação deve ser depois desta',
      })
    }
    const needsJustification =
      data.nextIntervalBand === 'TOO_SHORT' ||
      data.nextIntervalBand === 'REQUIRES_STEP_REVIEW'
    if (needsJustification && !data.nextScheduleReason.trim()) {
      ctx.addIssue({
        path: ['nextScheduleReason'],
        code: z.ZodIssueCode.custom,
        message:
          data.nextIntervalBand === 'TOO_SHORT'
            ? 'Justifique o intervalo mais curto que o previsto'
            : 'Justifique o intervalo mais longo que o previsto',
      })
    }
    if (
      data.nextIntervalBand === 'REQUIRES_STEP_REVIEW' &&
      !data.nextScheduleReview
    ) {
      ctx.addIssue({
        path: ['nextScheduleReview'],
        code: z.ZodIssueCode.custom,
        message: 'Avalie se é preciso retroceder doses',
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
  'nextApplicationDate',
  'nextScheduleReason',
  'nextScheduleReview',
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
  nextApplicationDate: '',
  nextApplicationDatePlanned: '',
  nextIntervalBand: '',
  nextScheduleReason: '',
  nextScheduleReview: '',
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
