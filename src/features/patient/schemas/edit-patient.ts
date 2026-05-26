import { z } from 'zod'
import { nameSchema, phoneSchema } from '@/shared/lib/field-schemas'

export const editPatientSchema = z.object({
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
})

export type EditPatientForm = z.infer<typeof editPatientSchema>
