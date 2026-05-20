import { z } from 'zod'
import { passwordSchema, nameSchema } from '@/shared/lib/field-schemas'

export const registerSchema = z
  .object({
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
    specialty: z.string().min(1, 'Selecione uma especialidade'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterForm = z.infer<typeof registerSchema>
