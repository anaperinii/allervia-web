import { useRef, useEffect } from 'react'
import { cn } from '@/shared/lib/cn'

interface VerificationCodeInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: string | null
  autoFocus?: boolean
  'aria-label'?: string
}

export function VerificationCodeInput({
  value,
  onChange,
  length = 6,
  error,
  autoFocus = false,
  'aria-label': ariaLabel = 'Código de verificação',
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus()
  }, [autoFocus])

  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const setDigitAt = (index: number, digit: string) => {
    const arr = digits.slice()
    arr[index] = digit
    onChange(arr.join(''))
  }

  const handleChange = (index: number, raw: string) => {
    const next = raw.length > 1 ? raw.slice(-1) : raw
    if (next && !/^\d$/.test(next)) return
    setDigitAt(index, next)
    if (next && index < length - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted.length === length) {
      onChange(pasted)
      inputRefs.current[length - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2.5" role="group" aria-label={ariaLabel} onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          aria-label={`Dígito ${i + 1} de ${length}`}
          aria-invalid={!!error || undefined}
          className={cn(
            'w-11 h-12 rounded-xl border text-center text-lg font-bold bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all',
            error ? 'border-red-400 bg-red-50/30' : 'border-(--border-custom)',
          )}
        />
      ))}
    </div>
  )
}
