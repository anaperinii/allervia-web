import { maskWithPrefix } from '@/shared/lib/mask'

export function maskName(value: string, anonymized: boolean): string {
  return anonymized ? maskWithPrefix(value) : value
}

export function maskCpf(cpf: string, anonymized: boolean): string {
  return anonymized ? '***.***.***-**' : cpf
}

export function maskPhone(phone: string, anonymized: boolean): string {
  return anonymized ? '(**) *****-****' : phone
}
