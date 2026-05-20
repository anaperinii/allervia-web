import { z } from 'zod'
import { emailSchema } from '@/shared/lib/field-schemas'

export const trialSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome muito curto'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  email: emailSchema,
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((v) => {
      const d = v.replace(/\D/g, '').length
      return d >= 10 && d <= 11
    }, 'Telefone inválido'),
  role: z.string().min(1, 'Selecione sua atuação'),
  solution: z.string().min(1, 'Selecione uma opção'),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  professionals: z
    .string()
    .min(1, 'Informe o número')
    .refine((v) => {
      const n = parseInt(v, 10)
      return !isNaN(n) && n >= 1 && n <= 9999
    }, 'Número inválido'),
})

export type TrialForm = z.infer<typeof trialSchema>
