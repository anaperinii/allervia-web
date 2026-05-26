export function downloadFile(content: string | Blob, filename: string, mime: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function safeFilename(name: string, format: string): string {
  const slug = name.replace(/\s+/g, '_').toLowerCase()
  return `${slug}_${format}`
}
