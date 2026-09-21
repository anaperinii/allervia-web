/**
 * Célula CSV segura: aspas escapadas e fórmulas neutralizadas. Valores que
 * começam com `=`, `+`, `-`, `@`, tab ou CR seriam interpretados como fórmula
 * por planilhas; o apóstrofo os degrada a texto sem alterar o dado clínico.
 */
export function csvCell(value: unknown): string {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function csvLine(values: unknown[]): string {
  return values.map(csvCell).join(',')
}
