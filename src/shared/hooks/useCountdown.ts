import { useEffect, useState } from 'react'

interface CountdownState {
  seconds: number
  formatted: string
  isExpired: boolean
}

export function useCountdown(initialSeconds: number, resetKey: unknown = null): CountdownState {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [initialSeconds, resetKey])

  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  const formatted = `${minutes}:${String(remaining).padStart(2, '0')}`

  return { seconds, formatted, isExpired: seconds === 0 }
}
