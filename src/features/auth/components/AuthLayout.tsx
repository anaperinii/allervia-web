import type { CSSProperties, ReactNode } from 'react'
import { AllerviaAuthBackground } from '@/features/landing-page/components/AllerviaAuthBackground'

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
    <section
      className="relative w-full min-h-screen"
      style={{
        background: 'var(--ll-bg)',
        padding: 'var(--ll-hero-frame-pad)',
        transition:
          'padding 0.55s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.55s ease',
      }}
    >
      <div
        className="relative overflow-hidden flex flex-col text-white"
        style={{
          background: '#08191d',
          borderRadius: 'var(--ll-hero-frame-radius)',
          minHeight: 'calc(100vh - 2 * var(--ll-hero-frame-pad))',
          transition:
            'border-radius 0.55s cubic-bezier(0.22, 1, 0.36, 1), min-height 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <AllerviaAuthBackground />
        <div className="relative z-10 flex flex-1 items-center justify-center px-6 pt-28 pb-12">
          <div
            style={{
              ...cardRiseStyle,
              background: 'rgba(8,25,29,0.40)',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.14)',
              boxShadow:
                '0 40px 100px -30px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.10)',
              color: '#DCE1E5',
            }}
            className="
              allervia-dark-form
              flex w-full max-w-lg flex-col gap-7 rounded-2xl p-8 sm:p-10
              [&_label]:!text-white/80
              [&_input]:!bg-white/[0.06] [&_input]:!border-white/15 [&_input]:!text-white
              [&_input::placeholder]:!text-white/40
            "
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
