function toISODateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayStr(): string {
  return toISODateString(new Date())
}

export function tomorrowStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
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
