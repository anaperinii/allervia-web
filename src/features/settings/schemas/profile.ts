import { z } from 'zod'
import { nameSchema, phoneSchema } from '@/shared/lib/field-schemas'

export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  councilNumber: z
    .string()
    .max(20, 'Número do conselho muito longo')
    .optional()
    .or(z.literal('')),
  councilUf: z
    .string()
    .regex(/^[A-Za-z]{2}$/, 'Use a sigla do estado, com duas letras')
    .optional()
    .or(z.literal('')),
})

export type ProfileForm = z.infer<typeof profileSchema>
