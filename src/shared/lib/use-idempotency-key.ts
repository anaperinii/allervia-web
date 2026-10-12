import { useRef } from 'react'

export function useIdempotencyKey(): (payload: unknown) => string {
  const memo = useRef<{ fingerprint: string; key: string } | null>(null)
  return (payload: unknown) => {
    const fingerprint = JSON.stringify(payload)
    if (memo.current === null || memo.current.fingerprint !== fingerprint) {
      memo.current = { fingerprint, key: crypto.randomUUID() }
    }
    return memo.current.key
  }
}
