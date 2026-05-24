import { z } from 'zod'
import { emailSchema } from '@/shared/lib/field-schemas'

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type LoginForm = z.infer<typeof loginSchema>
