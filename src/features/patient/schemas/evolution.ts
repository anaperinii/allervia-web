import { z } from 'zod'
import type { FieldPath } from 'react-hook-form'
import { volumeSchema, concentrationSchema } from '@/shared/lib/field-schemas'

const yesNo = z.enum(['Sim', 'Não'])
const ajusteReacaoValues = z.enum(['', 'reduzir_dose', 'aumentar_intervalo', 'suspender', 'manter'])

/**
 * Schema da evolução clínica do paciente (registro de aplicação).
 *
 * Regras cross-field via superRefine:
 * - efeitoColateral/necessidadeMedicacao = "Sim" → campo de descrição correspondente obrigatório
 * - horaInicio >= horaFim → erro em horaFim
 * - intervaloProxima fora de [7,14,21,28] → justificativa obrigatória (min 10 chars)
 * - efeitoColateralPos + necessidadeMedicacaoPos = "Sim" → ajusteReacao obrigatório
 * - ajusteReacao = "manter" → justificativa obrigatória
 */
export const evolutionSchema = z
  .object({
    // Step 1 — Pré-Aplicação
    intervaloRelato: z.string().min(1, 'Relato do intervalo é obrigatório'),
    efeitoColateral: yesNo,
    efeitosRelatados: z.string(),
    necessidadeMedicacao: yesNo,
    medicacoes: z.string(),
    notasPre: z.string(),

    // Step 2 — Pós-Aplicação
    dataAplicacao: z.string().min(1, 'Data é obrigatória'),
    horaInicio: z.string().min(1, 'Hora de início é obrigatória'),
    horaFim: z.string().min(1, 'Hora de fim é obrigatória'),
    volumeAplicado: volumeSchema,
    concentracao: concentrationSchema,
    intervaloProxima: z.string(),
    intervaloJustificativa: z.string(),
    responsavel: z.string().min(1, 'Responsável é obrigatório'),
    efeitoColateralPos: yesNo,
    efeitosRelatadosPos: z.string(),
    necessidadeMedicacaoPos: yesNo,
    medicacoesPos: z.string(),
    notasPos: z.string(),
    ajusteReacao: ajusteReacaoValues,
    ajusteReacaoJustificativa: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.efeitoColateral === 'Sim' && !data.efeitosRelatados.trim()) {
      ctx.addIssue({
        path: ['efeitosRelatados'],
        code: z.ZodIssueCode.custom,
        message: 'Descreva os efeitos colaterais',
      })
    }
    if (data.necessidadeMedicacao === 'Sim' && !data.medicacoes.trim()) {
      ctx.addIssue({
        path: ['medicacoes'],
        code: z.ZodIssueCode.custom,
        message: 'Informe as medicações administradas',
      })
    }

    if (data.horaInicio && data.horaFim && data.horaInicio >= data.horaFim) {
      ctx.addIssue({
        path: ['horaFim'],
        code: z.ZodIssueCode.custom,
        message: 'Hora fim deve ser após início',
      })
    }

    const intervalo = data.intervaloProxima.trim()
    if (!intervalo) {
      ctx.addIssue({
        path: ['intervaloProxima'],
        code: z.ZodIssueCode.custom,
        message: 'Intervalo é obrigatório',
      })
    } else if (!['7', '14', '21', '28'].includes(intervalo)) {
      const just = data.intervaloJustificativa.trim()
      if (!just) {
        ctx.addIssue({
          path: ['intervaloJustificativa'],
          code: z.ZodIssueCode.custom,
          message: 'Justifique o intervalo personalizado',
        })
      } else if (just.length < 10) {
        ctx.addIssue({
          path: ['intervaloJustificativa'],
          code: z.ZodIssueCode.custom,
          message: 'Justificativa deve ter ao menos 10 caracteres',
        })
      }
    }

    if (data.efeitoColateralPos === 'Sim' && !data.efeitosRelatadosPos.trim()) {
      ctx.addIssue({
        path: ['efeitosRelatadosPos'],
        code: z.ZodIssueCode.custom,
        message: 'Descreva os efeitos colaterais',
      })
    }
    if (data.necessidadeMedicacaoPos === 'Sim' && !data.medicacoesPos.trim()) {
      ctx.addIssue({
        path: ['medicacoesPos'],
        code: z.ZodIssueCode.custom,
        message: 'Informe as medicações',
      })
    }
    if (
      data.efeitoColateralPos === 'Sim' &&
      data.necessidadeMedicacaoPos === 'Sim' &&
      !data.ajusteReacao
    ) {
      ctx.addIssue({
        path: ['ajusteReacao'],
        code: z.ZodIssueCode.custom,
        message: 'Selecione a conduta para o protocolo',
      })
    }
    if (data.ajusteReacao === 'manter' && !data.ajusteReacaoJustificativa.trim()) {
      ctx.addIssue({
        path: ['ajusteReacaoJustificativa'],
        code: z.ZodIssueCode.custom,
        message: 'Justifique por que manter o protocolo',
      })
    }
  })

export type EvolutionForm = z.infer<typeof evolutionSchema>

export const STEP_1_FIELDS = [
  'intervaloRelato',
  'efeitoColateral',
  'efeitosRelatados',
  'necessidadeMedicacao',
  'medicacoes',
  'notasPre',
] as const satisfies readonly FieldPath<EvolutionForm>[]

export const STEP_2_FIELDS = [
  'dataAplicacao',
  'horaInicio',
  'horaFim',
  'volumeAplicado',
  'concentracao',
  'intervaloProxima',
  'intervaloJustificativa',
  'responsavel',
  'efeitoColateralPos',
  'efeitosRelatadosPos',
  'necessidadeMedicacaoPos',
  'medicacoesPos',
  'notasPos',
  'ajusteReacao',
  'ajusteReacaoJustificativa',
] as const satisfies readonly FieldPath<EvolutionForm>[]

export const EVOLUTION_DEFAULTS: EvolutionForm = {
  intervaloRelato: '',
  efeitoColateral: 'Não',
  efeitosRelatados: '',
  necessidadeMedicacao: 'Não',
  medicacoes: '',
  notasPre: '',
  dataAplicacao: '',
  horaInicio: '',
  horaFim: '',
  volumeAplicado: '',
  concentracao: '',
  intervaloProxima: '',
  intervaloJustificativa: '',
  responsavel: '',
  efeitoColateralPos: 'Não',
  efeitosRelatadosPos: '',
  necessidadeMedicacaoPos: 'Não',
  medicacoesPos: '',
  notasPos: '',
  ajusteReacao: '',
  ajusteReacaoJustificativa: '',
}
