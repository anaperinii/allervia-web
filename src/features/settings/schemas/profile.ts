import { z } from 'zod'
import { nameSchema, phoneSchema } from '@/shared/lib/field-schemas'

/**
 * Campos do perfil profissional que o próprio usuário edita. E-mail, papéis,
 * organização e profissão ficam de fora: cada um tem contrato próprio, e
 * alterá-los aqui daria a impressão de que o cadastro concede acesso.
 */
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
