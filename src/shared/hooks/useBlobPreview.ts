import { useEffect, useState } from 'react'

interface PdfDocument { output(type: 'blob'): Blob }


export function useBlobPreview<T>(data: T | null, enabled: boolean, build: (data: T) => PdfDocument) {
  const [preview, setPreview] = useState<{ data: T; url: string } | null>(null)
  const [failure, setFailure] = useState<{ data: T; error: Error } | null>(null)
  useEffect(() => {
    if (!enabled || data === null) return
    let url: string | undefined
    const timer = setTimeout(() => {
      try {
        url = URL.createObjectURL(build(data).output('blob'))
        setPreview({ data, url })
      } catch (error) {
        setFailure({ data, error: error instanceof Error ? error : new Error('PDF generation failed') })
      }
    }, 100)
    return () => {
      clearTimeout(timer)
      if (url) URL.revokeObjectURL(url)
    }
  }, [data, enabled, build])
  if (enabled && data !== null && failure?.data === data) throw failure.error
  return enabled && data !== null && preview?.data === data ? preview.url : null
}
