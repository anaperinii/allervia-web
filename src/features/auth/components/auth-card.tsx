import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'

const SLIDES = [
  'Centralize, acompanhe e otimize o tratamento imunoterápico dos seus pacientes.',
  'Tecnologia que cuida para você se concentrar no que realmente transforma vidas.',
  'Mais clareza nos ciclos, mais confiança nas decisões. Imunoterapia conduzida com excelência.',
]

const AUTO_ADVANCE_MS = 5000

interface AuthCardProps {
  initialSlide?: number
  className?: string
  style?: React.CSSProperties
}

export function AuthCard({ initialSlide = 0, className, style }: AuthCardProps) {
  const [current, setCurrent] = useState(initialSlide)

  useEffect(() => {
    const id = setTimeout(() => {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }, AUTO_ADVANCE_MS)
    return () => clearTimeout(id)
  }, [current])

  return (
    <div className={cn("hidden md:flex flex-1 min-h-120 max-h-140 relative rounded-3xl overflow-hidden bg-linear-to-br from-teal-500 via-cyan-500 to-teal-400 p-10", className)} style={style}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-cyan-600/40 blur-3xl" />
      </div>

      <svg className="absolute -right-15 -top-15 w-70 h-70 opacity-25" viewBox="0 0 280 280" fill="none">
        <path d="M240 40 C200 20 120 60 100 120 C80 180 140 220 180 200 C220 180 240 120 200 100 C160 80 100 120 120 160" stroke="white" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M200 20 C160 0 80 40 60 100 C40 160 100 200 140 180" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none" opacity=".6" />
      </svg>
      <svg className="absolute -left-10 -bottom-12.5 w-50 h-50 opacity-20" viewBox="0 0 200 200" fill="none">
        <path d="M160 160 C120 140 40 160 20 120 C0 80 40 40 80 60 C120 80 140 140 100 160" stroke="white" strokeWidth="14" strokeLinecap="round" fill="none" />
      </svg>

      <div className="relative z-10 max-w-md flex items-end overflow-hidden">
        <div className="flex flex-col gap-3 border-l-2 border-[#7FFFD4]/70 pl-5">
          <span className="text-[0.6rem] uppercase tracking-[2px] font-bold text-white/75">
            Imunoterapia conectada
          </span>
          <p
            key={current}
            className="text-white font-semibold text-[clamp(1.25rem,1.95vw,1.7rem)] leading-snug tracking-tight"
            style={{ animation: 'slide-in-right 0.45s ease-out' }}
          >
            {SLIDES[current]}
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300 focus:outline-none"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: i === current ? 'default' : 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}
