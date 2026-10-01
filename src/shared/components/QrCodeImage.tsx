import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeImageProps {
  value: string
  size?: number
  className?: string
  'aria-label'?: string
}

export function QrCodeImage({
  value,
  size = 176,
  className,
  'aria-label': ariaLabel = 'QR code para o aplicativo autenticador',
}: QrCodeImageProps) {
  const [svg, setSvg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then((markup) => {
        if (!cancelled) setSvg(markup)
      })
      .catch(() => {
        if (!cancelled) setSvg(null)
      })
    return () => {
      cancelled = true
    }
  }, [value])

  if (!svg) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    )
  }

  return (
    <img
      src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
      alt={ariaLabel}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
