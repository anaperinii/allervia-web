import { z } from 'zod'
import { emailSchema } from '@/shared/lib/field-schemas'

export const trialSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
  lastName: z.string().trim().min(1, 'Sobrenome é obrigatório').max(100, 'Sobrenome muito longo'),
  email: z.string().trim().max(320).pipe(emailSchema),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine((v) => {
      const d = v.replace(/\D/g, '').length
      return d >= 10 && d <= 11
    }, 'Telefone inválido'),
  role: z.string().refine((v) => ['doctor', 'clinic_manager', 'pharmacist', 'nurse', 'other'].includes(v), 'Selecione sua atuação'),
  solution: z.string().refine((v) => ['self', 'single_clinic', 'clinic_network'].includes(v), 'Selecione uma opção'),
  specialty: z.string().trim().min(1, 'Especialidade é obrigatória').max(200, 'Especialidade muito longa'),
  professionals: z.string().regex(/^[1-9]\d{0,3}$/, 'Informe um número inteiro entre 1 e 9999'),
})

export type TrialForm = z.infer<typeof trialSchema>
