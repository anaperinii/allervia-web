import { z } from 'zod'
import type { FieldPath } from 'react-hook-form'
import { volumeSchema, concentrationSchema } from '@/shared/lib/field-schemas'
import { PROTOCOL_INTERVAL_PRESET_STRINGS } from '@/features/immunotherapy/constants/scit-protocol'

const yesNo = z.enum(['yes', 'no'])
const reactionAdjustmentValues = z.enum(['', 'reduce_dose', 'increase_interval', 'suspend', 'maintain'])

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
    endTime: z.string().min(1, 'Hora de fim é obrigatória'),
    appliedVolume: volumeSchema,
    concentration: concentrationSchema,
    nextInterval: z.string(),
    intervalJustification: z.string(),
    administrator: z.string().min(1, 'Responsável é obrigatório'),
    sideEffectPost: yesNo,
    reportedEffectsPost: z.string(),
    medicationNeededPost: yesNo,
    medicationsPost: z.string(),
    notesPost: z.string(),
    reactionAdjustment: reactionAdjustmentValues,
    reactionAdjustmentJustification: z.string(),
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

    const interval = data.nextInterval.trim()
    if (!interval) {
      ctx.addIssue({
        path: ['nextInterval'],
        code: z.ZodIssueCode.custom,
        message: 'Intervalo é obrigatório',
      })
    } else if (!PROTOCOL_INTERVAL_PRESET_STRINGS.includes(interval)) {
      const just = data.intervalJustification.trim()
      if (!just) {
        ctx.addIssue({
          path: ['intervalJustification'],
          code: z.ZodIssueCode.custom,
          message: 'Justifique o intervalo personalizado',
        })
      } else if (just.length < 10) {
        ctx.addIssue({
          path: ['intervalJustification'],
          code: z.ZodIssueCode.custom,
          message: 'Justificativa deve ter ao menos 10 caracteres',
        })
      }
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
      !data.reactionAdjustment
    ) {
      ctx.addIssue({
        path: ['reactionAdjustment'],
        code: z.ZodIssueCode.custom,
        message: 'Selecione a conduta para o protocolo',
      })
    }
    if (data.reactionAdjustment === 'maintain' && !data.reactionAdjustmentJustification.trim()) {
      ctx.addIssue({
        path: ['reactionAdjustmentJustification'],
        code: z.ZodIssueCode.custom,
        message: 'Justifique por que manter o protocolo',
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
  'appliedVolume',
  'concentration',
  'nextInterval',
  'intervalJustification',
  'administrator',
  'sideEffectPost',
  'reportedEffectsPost',
  'medicationNeededPost',
  'medicationsPost',
  'notesPost',
  'reactionAdjustment',
  'reactionAdjustmentJustification',
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
  appliedVolume: '',
  concentration: '',
  nextInterval: '',
  intervalJustification: '',
  administrator: '',
  sideEffectPost: 'no',
  reportedEffectsPost: '',
  medicationNeededPost: 'no',
  medicationsPost: '',
  notesPost: '',
  reactionAdjustment: '',
  reactionAdjustmentJustification: '',
}
