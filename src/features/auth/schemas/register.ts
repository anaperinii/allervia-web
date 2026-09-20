import { z } from 'zod'
import { passwordSchema, nameSchema, phoneSchema } from '@/shared/lib/field-schemas'

/** Profissões aceitas pelo servidor; descrevem a pessoa, não o acesso. */
export const PROFESSION_OPTIONS = [
  { value: 'PHYSICIAN', label: 'Médico(a)' },
  { value: 'NURSE', label: 'Enfermeiro(a)' },
  { value: 'NURSING_TECHNICIAN', label: 'Técnico(a) em Enfermagem' },
  { value: 'RECEPTIONIST', label: 'Recepção' },
] as const

export const registerSchema = z
  .object({
    name: nameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
    profession: z.enum(['PHYSICIAN', 'NURSE', 'NURSING_TECHNICIAN', 'RECEPTIONIST'], {
      message: 'Selecione a sua profissão',
    }),
    phoneNumber: phoneSchema,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterForm = z.infer<typeof registerSchema>
