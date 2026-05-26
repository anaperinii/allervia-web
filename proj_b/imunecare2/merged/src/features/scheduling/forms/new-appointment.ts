import { z } from 'zod'
import { PROTOCOL_INTERVAL_PRESET_STRINGS } from '@/features/immunotherapy/constants/scit-protocol'

export const newAppointmentSchema = z
  .object({
    patientId: z.string().min(1, 'Selecione o paciente'),
    date: z.string().min(1, 'Data é obrigatória'),
    startTime: z.string().min(1, 'Hora de início é obrigatória'),
    endTime: z.string().min(1, 'Hora de fim é obrigatória'),
    dose: z.string().min(1, 'Selecione a dose'),
    interval: z.string().min(1, 'Selecione o intervalo'),
    intervalJustification: z.string(),
    notes: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      ctx.addIssue({
        path: ['endTime'],
        code: z.ZodIssueCode.custom,
        message: 'Hora fim deve ser após início',
      })
    }

    const intervalTrim = data.interval.trim()
    const isNumeric = /^\d+$/.test(intervalTrim)
    if (intervalTrim && !isNumeric) {
      ctx.addIssue({
        path: ['interval'],
        code: z.ZodIssueCode.custom,
        message: 'Informe um número válido de dias',
      })
    }

    const isPreset = PROTOCOL_INTERVAL_PRESET_STRINGS.includes(intervalTrim)
    if (intervalTrim && isNumeric && !isPreset) {
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
  })

export type NewAppointmentForm = z.infer<typeof newAppointmentSchema>

export const NEW_APPOINTMENT_DEFAULTS: NewAppointmentForm = {
  patientId: '',
  date: '',
  startTime: '',
  endTime: '',
  dose: '',
  interval: '7',
  intervalJustification: '',
  notes: '',
}
