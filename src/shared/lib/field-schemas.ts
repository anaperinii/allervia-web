import { z } from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório')
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'E-mail inválido')

export const passwordSchema = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(8, 'Mínimo de 8 caracteres')
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/,
    'Deve conter maiúscula, minúscula, número e caractere especial',
  )

function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[9]) !== check) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  return parseInt(digits[10]) === check
}

export const cpfSchema = z
  .string()
  .min(1, 'CPF é obrigatório')
  .refine(isValidCPF, 'CPF inválido')


export const phoneSchema = z
  .string()
  .min(1, 'Telefone é obrigatório')
  .refine((v) => v.replace(/\D/g, '').length === 11, 'Telefone inválido (11 dígitos)')


export const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .min(3, 'Nome deve ter ao menos 3 caracteres')
  .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'Nome deve conter apenas letras')


export const weightSchema = z
  .string()
  .min(1, 'Peso é obrigatório')
  .refine((v) => {
    const n = parseFloat(v.replace(',', '.'))
    return !isNaN(n) && n > 0 && n <= 500
  }, 'Peso inválido (0–500 kg)')


export const birthdateSchema = z
  .string()
  .min(1, 'Data de nascimento é obrigatória')
  .refine((v) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(v + 'T12:00')
    const minDate = new Date(today)
    minDate.setFullYear(minDate.getFullYear() - 130)
    return date <= today && date >= minDate
  }, 'Data de nascimento inválida')


export const futureDateSchema = z
  .string()
  .min(1, 'Data é obrigatória')
  .refine((v) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(v + 'T12:00') >= today
  }, 'Selecione uma data presente ou futura')
  .refine((v) => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2)
    return new Date(v + 'T12:00') <= maxDate
  }, 'Data não pode ser mais de 2 anos no futuro')


// Para campos de data futura opcionais (ex: previsão de retorno na inativação)
export const optionalFutureDateSchema = z
  .string()
  .refine((v) => {
    if (!v) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(v + 'T12:00') >= today
  }, 'Selecione uma data presente ou futura')
  .refine((v) => {
    if (!v) return true
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2)
    return new Date(v + 'T12:00') <= maxDate
  }, 'Data não pode ser mais de 2 anos no futuro')


const EXTRATO_COMPONENT_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+)*\s+\d+(?:\.\d+)?%$/

export const extratoSchema = z
  .string()
  .min(1, 'Extrato é obrigatório')
  .superRefine((value, ctx) => {
    const parts = value.split('+').map((p) => p.trim())
    if (parts.length === 0 || (parts.length === 1 && !parts[0])) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Extrato inválido' })
      return
    }
    for (const part of parts) {
      if (!EXTRATO_COMPONENT_RE.test(part)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Componente inválido: "${part}". Use: Rótulo número% (ex: Der p 60%).`,
        })
        return
      }
    }
    const total = parts.reduce((sum, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)%$/)
      return sum + (m ? parseFloat(m[1]) : 0)
    }, 0)
    if (Math.abs(total - 100) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `A soma dos percentuais deve ser 100% (atual: ${total.toFixed(1)}%)`,
      })
    }
  })

  
// Permite 1:N onde N tem no máximo 5 dígitos (podendo usar ponto separador de milhar)
// Exemplos válidos: 1:10, 1:100, 1:1.000, 1:10.000, 1:10000 — máximo 5 dígitos numéricos após o :
export const concentrationSchema = z
  .string()
  .min(1, 'Concentração é obrigatória')
  .superRefine((value, ctx) => {
    // Verifica formato base: começa com "1:" seguido de dígitos/pontos separadores
    if (!/^1:[\d.]+$/.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Formato inválido. Use 1:N (ex: 1:10, 1:1.000, 1:10.000)' })
      return
    }
    const afterColon = value.slice(2)
    // Extrai somente os dígitos para contar (ignora pontos separadores de milhar)
    const digitsOnly = afterColon.replace(/\./g, '')
    if (!/^\d+$/.test(digitsOnly)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Formato inválido. Use 1:N (ex: 1:10, 1:1.000, 1:10.000)' })
      return
    }
    if (digitsOnly.length > 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Concentração inválida: máximo 5 dígitos após o : (ex: 1:10.000)' })
      return
    }
    if (digitsOnly.length === 0 || parseInt(digitsOnly, 10) === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Concentração deve ser maior que zero' })
    }
  })


export const volumeSchema = z
  .string()
  .min(1, 'Volume é obrigatório')
  .superRefine((value, ctx) => {
    const normalized = value.replace(',', '.')
    if (!/^\d+(\.\d{1,3})?$/.test(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Formato inválido (máx. 3 casas decimais, ex: 0.5)',
      })
      return
    }
    const n = parseFloat(normalized)
    if (n <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Volume deve ser maior que 0' })
    } else if (n > 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Volume inválido (máx. 10 ml)' })
    }
  })
