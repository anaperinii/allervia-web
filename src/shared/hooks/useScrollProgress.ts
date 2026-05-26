import { useEffect, useState } from 'react'

export function useScrollProgress(viewportMultiplier = 2): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId = 0
    const update = () => {
      const range = window.innerHeight * viewportMultiplier
      const next = Math.max(0, Math.min(1, window.scrollY / range))
      setProgress((prev) => (prev === next ? prev : next))
    }
    update()
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [viewportMultiplier])

  return progress
}
