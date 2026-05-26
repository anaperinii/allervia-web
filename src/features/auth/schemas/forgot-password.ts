import { z } from 'zod'
import { emailSchema, passwordSchema } from '@/shared/lib/field-schemas'

export const forgotPasswordEmailSchema = z.object({ email: emailSchema })
export type ForgotPasswordEmailForm = z.infer<typeof forgotPasswordEmailSchema>

export const forgotPasswordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
export type ForgotPasswordResetForm = z.infer<typeof forgotPasswordResetSchema>
