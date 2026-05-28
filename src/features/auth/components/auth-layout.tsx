import type { CSSProperties, ReactNode } from 'react'
import { AuroraBackground } from '@/features/landing-page/components/aurora-background'

interface AuthLayoutProps {
  children: ReactNode
}

const cardRiseStyle: CSSProperties = {
  opacity: 0,
  filter: 'blur(18px)',
  transform: 'translateY(28px)',
  animation: 'hero-rise 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden pt-17">
      <AuroraBackground fadeBottom={false} />
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div
          style={cardRiseStyle}
          className="flex w-full max-w-lg flex-col gap-7 rounded-[28px] border border-white/55 bg-white/45 p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(20,184,166,0.18),0_8px_24px_rgba(15,23,42,0.08)] sm:p-12"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
