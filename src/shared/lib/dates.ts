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
