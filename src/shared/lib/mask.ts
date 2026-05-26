export function maskWithPrefix(value: string, prefixLength = 3): string {
  if (value.length <= prefixLength) return '*'.repeat(Math.max(prefixLength, 3))
  return value.slice(0, prefixLength) + '*'.repeat(Math.max(value.length - prefixLength, 3))
}

export function maskName(value: string, anonymized: boolean): string {
  return anonymized ? maskWithPrefix(value) : value
}

export function maskCpf(cpf: string, anonymized: boolean): string {
  return anonymized ? '***.***.***-**' : cpf
}

export function maskPhone(phone: string, anonymized: boolean): string {
  return anonymized ? '(**) *****-****' : phone
}
