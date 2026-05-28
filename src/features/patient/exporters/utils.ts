export function maskName(value: string, anonymized: boolean): string {
  if (!anonymized) return value
  if (value.length <= 3) return '***'
  return value.slice(0, 3) + '*'.repeat(Math.max(value.length - 3, 3))
}

export function maskCpf(cpf: string, anonymized: boolean): string {
  return anonymized ? '***.***.***-**' : cpf
}

export function maskPhone(phone: string, anonymized: boolean): string {
  return anonymized ? '(**) *****-****' : phone
}

export function downloadFile(content: string | Blob, filename: string, mime: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function safeFilename(name: string, format: string): string {
  const slug = name.replace(/\s+/g, '_').toLowerCase()
  return `${slug}_${format}`
}
