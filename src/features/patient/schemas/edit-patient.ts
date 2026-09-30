import { z } from 'zod'
import { cpfSchema, nameSchema, phoneSchema } from '@/shared/lib/field-schemas'

const editPatientBaseSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  weight: z
    .string()
    .min(1, 'Peso é obrigatório')
    .refine((v) => {
      const n = parseFloat(v.replace(',', '.').replace(/[^\d.]/g, ''))
      return !isNaN(n) && n > 0 && n <= 500
    }, 'Peso inválido (0–500 kg)'),
  responsibleDoctor: z.string().min(3, 'Médico responsável é obrigatório'),
  guardianName: z.string().optional(),
  guardianCpf: z.string().optional(),
  guardianPhone: z.string().optional(),
})

export const editPatientSchema = editPatientBaseSchema

/** Variante para menores de idade: responsável legal obrigatório. */
export const editMinorPatientSchema = editPatientBaseSchema.superRefine(
  (data, ctx) => {
    const nameResult = nameSchema.safeParse(data.guardianName ?? '')
    if (!nameResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['guardianName'],
        message: nameResult.error.issues[0].message,
      })
    }
    const cpfResult = cpfSchema.safeParse(data.guardianCpf ?? '')
    if (!cpfResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['guardianCpf'],
        message: cpfResult.error.issues[0].message,
      })
    }
    const phoneResult = phoneSchema.safeParse(data.guardianPhone ?? '')
    if (!phoneResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['guardianPhone'],
        message: phoneResult.error.issues[0].message,
      })
    }
  },
)

export type EditPatientForm = z.infer<typeof editPatientBaseSchema>
