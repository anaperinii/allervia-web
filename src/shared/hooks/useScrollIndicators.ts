import { useEffect, useRef, useState } from 'react'

export function useScrollIndicators<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 2)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    const raf = requestAnimationFrame(update)
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    Array.from(el.children).forEach((c) => ro.observe(c))
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [])

  const scrollBy = (direction: 'left' | 'right') => {
    const el = ref.current
    if (!el) return
    el.scrollBy({
      left: direction === 'left' ? -el.clientWidth * 0.6 : el.clientWidth * 0.6,
      behavior: 'smooth',
    })
  }

  return { ref, canScrollLeft, canScrollRight, scrollBy }
}
