import { useEffect, useRef } from 'react'
import { PatientChartTablet } from '@/features/landing-page/components/PatientChartTablet'
import { useScrollProgress } from '@/shared/hooks/useScrollProgress'

export function ScrollRevealSection() {
  const cardRef = useRef<HTMLDivElement>(null)
  const progress = useScrollProgress(2)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const { translateY, scale, opacity, blur } = computeTransform(progress)
    card.style.transform = `translateY(${translateY}vh) scale(${scale})`
    card.style.opacity = String(opacity)
    card.style.filter = `blur(${blur}px)`
  }, [progress])

  return (
    <section className="relative h-screen pointer-events-none">
      <div
        ref={cardRef}
        className="fixed inset-0 z-20 flex items-center justify-center px-[5%]"
        style={{
          transform: 'translateY(25vh) scale(0.7)',
          opacity: 0,
          filter: 'blur(10px)',
          willChange: 'transform, opacity, filter',
        }}
      >
        <PatientChartTablet
          rotation={{ y: -18, x: 4, translateX: 20 }}
          shadowClass="shadow-[0_40px_100px_rgba(0,70,40,0.35),0_16px_40px_rgba(20,184,166,0.25)]"
        />
      </div>
    </section>
  )
}

interface TabletTransform {
  translateY: number
  scale: number
  opacity: number
  blur: number
}

function computeTransform(p: number): TabletTransform {
  if (p < 0.2) {
    const t = p / 0.2
    return {
      translateY: 25 - 25 * t,
      scale: 0.7 + 0.3 * t,
      opacity: Math.min(1, t * 1.3),
      blur: 10 * (1 - Math.min(1, t * 1.3)),
    }
  }
  if (p < 0.55) {
    return { translateY: 0, scale: 1, opacity: 1, blur: 0 }
  }
  if (p < 0.85) {
    const t = (p - 0.55) / 0.3
    return { translateY: -15 * t, scale: 1 + 0.02 * t, opacity: 1, blur: 0 }
  }
  const t = (p - 0.85) / 0.15
  return { translateY: -15 - 35 * t, scale: 1.02 - 0.02 * t, opacity: 1 - t, blur: 0 }
}
