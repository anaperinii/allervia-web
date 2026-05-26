import { z } from 'zod'
import { birthdateSchema, emailSchema, nameSchema, phoneSchema } from '@/shared/lib/field-schemas'

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  specialty: z.string().min(3, 'Especialidade obrigatória'),
  institution: z.string().min(3, 'Instituição obrigatória'),
  birthDate: birthdateSchema,
})

export type ProfileForm = z.infer<typeof profileSchema>
