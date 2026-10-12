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

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const match = /^(\d{4}-\d{2}-\d{2})T/.exec(value)
  if (match) return match[1]
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  const parsed = new Date(year, month - 1, day)
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day ? parsed : null
}

export function toOffsetIso(date: string, time: string): string {
  const local = new Date(`${date}T${time}:00`)
  const offsetMinutes = -local.getTimezoneOffset()
  return `${date}T${time}:00${formatOffset(offsetMinutes)}`
}

function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hours = String(Math.floor(abs / 60)).padStart(2, '0')
  const minutes = String(abs % 60).padStart(2, '0')
  return `${sign}${hours}:${minutes}`
}

function zoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour'),
    read('minute'),
    read('second'),
  )
  return Math.round((asUtc - instant.getTime()) / 60_000)
}

export function toZonedOffsetIso(date: string, time: string, timeZone: string): string {
  const reference = new Date(`${date}T${time}:00Z`)
  const firstGuess = zoneOffsetMinutes(reference, timeZone)
  const offsetMinutes = zoneOffsetMinutes(
    new Date(reference.getTime() - firstGuess * 60_000),
    timeZone,
  )
  return `${date}T${time}:00${formatOffset(offsetMinutes)}`
}

export function dayInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function addDaysToDay(day: string, amount: number): string {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, date + amount)).toISOString().slice(0, 10)
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
  if (days === 0) return 'Iniciado hoje'
  if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'}`
  if (days < 365) {
    const months = Math.round(days / 30)
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  const years = days / 365.25
  const label = years.toFixed(1)
  return `${label} ${label === '1.0' ? 'ano' : 'anos'}`
}
