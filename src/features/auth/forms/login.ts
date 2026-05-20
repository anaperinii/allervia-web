import { z } from 'zod'
import { emailSchema } from '@/shared/lib/field-schemas'

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

export type LoginForm = z.infer<typeof loginSchema>
