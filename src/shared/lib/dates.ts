function toISODateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Data mínima fixa para todos os inputs de data: 1900-01-01. */
export const MIN_DATE_STR = '1900-01-01'

/** Retorna a string "1900-01-01" para uso em min= nos inputs de data. */
export function minDateStr(): string {
  return MIN_DATE_STR
}

export function todayStr(): string {
  return toISODateString(new Date())
}

export function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toISODateString(d)
}

/** Retorna a data máxima permitida em inputs de data futura: hoje + 2 anos */
export function maxFutureDateStr(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 2)
  return toISODateString(d)
}

export function parsePtDate(value: string): Date {
  const [day, month, year] = value.split('/')
  return new Date(Number(year), Number(month) - 1, Number(day))
}

export function comparePtDateDesc(a: string, b: string): number {
  return parsePtDate(b).getTime() - parsePtDate(a).getTime()
}

export function comparePtDateAsc(a: string, b: string): number {
  return parsePtDate(a).getTime() - parsePtDate(b).getTime()
}

/**
 * Verifica se um agendamento já passou (deve ser marcado como concluído automaticamente).
 * Regra: dia anterior ao dia atual, OU mesmo dia mas hora de fim já passou.
 */
export function isApplicationPast(dateStr: string, endTime: string): boolean {
  const now = new Date()
  const [d, m, y] = dateStr.split('/').map(Number)
  const appDate = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (appDate < today) return true
  if (appDate.getTime() === today.getTime()) {
    const [h, min] = endTime.split(':').map(Number)
    const endMs = h * 60 + min
    const nowMs = now.getHours() * 60 + now.getMinutes()
    return nowMs > endMs
  }
  return false
}

/**
 * Verifica se um agendamento é futuro (data ou hora futura).
 */
export function isApplicationFuture(dateStr: string, startTime: string): boolean {
  const now = new Date()
  const [d, m, y] = dateStr.split('/').map(Number)
  const appDate = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (appDate > today) return true
  if (appDate.getTime() === today.getTime()) {
    const [h, min] = startTime.split(':').map(Number)
    const startMs = h * 60 + min
    const nowMs = now.getHours() * 60 + now.getMinutes()
    return startMs > nowMs
  }
  return false
}

export function formatDurationFromDays(days: number): string {
  if (days < 0) return '—'
  if (days === 0) return 'iniciado hoje'
  if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'}`
  if (days < 365) {
    const months = Math.round(days / 30)
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  const years = days / 365.25
  const label = years.toFixed(1)
  return `${label} ${label === '1.0' ? 'ano' : 'anos'}`
}
