export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatWeight(value: string): string {
  const cleaned = value.replace(/[^0-9,.]/g, '').replace(',', '.')
  const parts = cleaned.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('')
  return cleaned
}

/**
 * Limpa entrada para o formato `1:N` preservando o separador de milhar pt-BR (`.`).
 * Auto-prefixa `1:` quando o usuário digita só dígitos. O ponto é mantido — ex: `1:10.000`
 * passa pela validação (`/^1:\d{1,3}(\.\d{3})*$/`). Strippar o ponto aqui faria o validator
 * rejeitar valores que o usuário digitou corretamente.
 */
export function formatConcentration(value: string): string {
  const cleaned = value.replace(/[^0-9.:]/g, '')
  if (!cleaned.includes(':') && cleaned.length > 0) {
    const digits = cleaned.replace(/\D/g, '')
    return digits.length > 0 ? `1:${digits}` : ''
  }
  return cleaned
}

/* Enforce up to 3 decimal digits for volume */
export function formatVolume(value: string): string {
  const cleaned = value.replace(/[^0-9,.]/g, '').replace(',', '.')
  const parts = cleaned.split('.')
  if (parts.length === 1) return parts[0]
  return parts[0] + '.' + parts[1].slice(0, 3)
}
