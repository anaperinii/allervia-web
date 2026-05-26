import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(target: number, durationMs = 500): number {
  const [value, setValue] = useState(target)
  const previousRef = useRef(target)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const start = previousRef.current
    const end = target
    if (start === end) return
    const startTime = performance.now()

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (end - start) * eased))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        previousRef.current = end
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [target, durationMs])

  return value
}
