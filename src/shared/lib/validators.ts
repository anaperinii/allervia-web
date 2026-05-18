export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'E-mail é obrigatório'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'E-mail inválido'
  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Senha é obrigatória'
  if (value.length < 8) return 'Mínimo de 8 caracteres'
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value))
    return 'Deve conter maiúscula, minúscula, número e caractere especial'
  return null
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Confirmação é obrigatória'
  if (password !== confirm) return 'As senhas não coincidem'
  return null
}

export function validateCPF(cpf: string): string | null {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return 'CPF inválido'
  if (/^(\d)\1+$/.test(digits)) return 'CPF inválido'
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[9]) !== check) return 'CPF inválido'
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[10]) !== check) return 'CPF inválido'
  return null
}

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return 'Telefone é obrigatório'
  if (digits.length !== 11) return 'Telefone inválido (11 dígitos)'
  return null
}

export function validateName(value: string, label = 'Nome'): string | null {
  if (!value.trim()) return `${label} é obrigatório`
  if (value.trim().length < 3) return `${label} deve ter ao menos 3 caracteres`
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value.trim())) return `${label} deve conter apenas letras`
  return null
}

export function validateWeight(value: string): string | null {
  if (!value.trim()) return 'Peso é obrigatório'
  const num = parseFloat(value.replace(',', '.'))
  if (isNaN(num) || num <= 0 || num > 500) return 'Peso inválido (0–500 kg)'
  return null
}

export function validateBirthdate(value: string): string | null {
  if (!value) return 'Data de nascimento é obrigatória'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value + 'T12:00')
  if (date > today) return 'Data de nascimento não pode ser futura'
  const minDate = new Date(today)
  minDate.setFullYear(minDate.getFullYear() - 130)
  if (date < minDate) return 'Data de nascimento inválida'
  return null
}

export function validateFutureDate(value: string, label = 'Data de início'): string | null {
  if (!value) return `${label} é obrigatória`
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value + 'T12:00')
  if (date < today) return 'Data inválida. Selecione uma data presente ou futura.'
  return null
}

/**
 * Extrato de alérgenos: componentes "Rótulo número%" somando 100%.
 * Rótulo aceita só letras e espaços (sem números, hífen ou pontuação).
 *
 * Valid:   "Der p 60% + Der f 10% + Blt 30%"
 * Valid:   "Blomia tropicalis 100%"
 * Invalid: "Der-p 60%" (hífen no rótulo)
 * Invalid: "Der p 60% + Der f 30%" (soma ≠ 100)
 */
const EXTRATO_COMPONENT_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]+)*\s+\d+(?:\.\d+)?%$/

export function validateExtrato(value: string): string | null {
  if (!value.trim()) return 'Extrato é obrigatório'

  const parts = value.split('+').map((p) => p.trim())
  if (parts.length === 0 || (parts.length === 1 && !parts[0])) return 'Extrato inválido'

  for (const part of parts) {
    if (!EXTRATO_COMPONENT_RE.test(part)) {
      return `Componente inválido: "${part}". Use: Rótulo número% (ex: Der p 60%). Rótulo: somente letras e espaços, sem números, hífen ou pontuação.`
    }
  }

  const total = parts.reduce((sum, part) => {
    const match = part.match(/(\d+(?:\.\d+)?)%$/)
    return sum + (match ? parseFloat(match[1]) : 0)
  }, 0)

  if (Math.abs(total - 100) > 0.01) {
    return `A soma dos percentuais deve ser 100% (atual: ${total.toFixed(1)}%)`
  }

  return null
}

/** Formato 1:N com separador de milhar opcional (pt-BR): 1:10, 1:1.000, 1:10.000. */
export function validateConcentration(value: string): string | null {
  if (!value.trim()) return 'Concentração é obrigatória'
  if (!/^1:\d{1,3}(\.\d{3})*$/.test(value.trim())) return 'Formato inválido. Use 1:N (ex: 1:10, 1:1.000, 1:10.000)'
  return null
}

/** Número positivo com até 3 casas decimais, máximo 10 ml. */
export function validateVolume(value: string): string | null {
  if (!value.trim()) return 'Volume é obrigatório'
  const normalized = value.replace(',', '.')
  if (!/^\d+(\.\d{1,3})?$/.test(normalized)) return 'Formato inválido (máx. 3 casas decimais, ex: 0.5)'
  const num = parseFloat(normalized)
  if (isNaN(num) || num <= 0) return 'Volume deve ser maior que 0'
  if (num > 10) return 'Volume inválido (máx. 10 ml)'
  return null
}
