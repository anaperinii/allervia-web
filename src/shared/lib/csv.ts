export function csvCell(value: unknown): string {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function csvLine(values: unknown[]): string {
  return values.map(csvCell).join(',')
}
