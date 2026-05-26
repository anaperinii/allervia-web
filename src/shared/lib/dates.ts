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

export function isoToPtDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function calculateAge(birthDateIso: string): number {
  const birth = new Date(birthDateIso + 'T12:00')
  if (isNaN(birth.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function formatIsoToPtOrDash(value: string): string {
  if (!value) return '—'
  try {
    const date = new Date(value + 'T12:00')
    if (isNaN(date.getTime())) return '—'
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return '—'
  }
}

export function parseIsoDate(value: string): Date | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  const parsed = new Date(year, month - 1, day)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function addMinutesToTime(time: string, minutes: number): string {
  const parts = time.split(':')
  if (parts.length !== 2) return ''
  const hours = parseInt(parts[0], 10)
  const mins = parseInt(parts[1], 10)
  if (isNaN(hours) || isNaN(mins)) return ''
  const total = hours * 60 + mins + minutes
  const newHours = Math.floor(total / 60) % 24
  const newMinutes = total % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

export function formatDurationFromIsoStart(start: string | null, end: Date = new Date()): string {
  if (!start || start === '—') return '—'
  try {
    const days = Math.round((end.getTime() - parsePtDate(start).getTime()) / (1000 * 60 * 60 * 24))
    return formatDurationFromDays(days)
  } catch {
    return '—'
  }
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
