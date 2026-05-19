import { z } from 'zod'
import { emailSchema } from '@/shared/lib/field-schemas'

export const trialSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome muito curto'),
  sobrenome: z.string().min(1, 'Sobrenome é obrigatório'),
  email: emailSchema,
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((v) => {
      const d = v.replace(/\D/g, '').length
      return d >= 10 && d <= 11
    }, 'Telefone inválido'),
  atuacao: z.string().min(1, 'Selecione sua atuação'),
  solucao: z.string().min(1, 'Selecione uma opção'),
  especialidade: z.string().min(1, 'Especialidade é obrigatória'),
  profissionais: z
    .string()
    .min(1, 'Informe o número')
    .refine((v) => {
      const n = parseInt(v, 10)
      return !isNaN(n) && n >= 1 && n <= 9999
    }, 'Número inválido'),
})

export type TrialForm = z.infer<typeof trialSchema>
