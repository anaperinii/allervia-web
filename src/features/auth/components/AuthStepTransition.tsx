import type { CSSProperties, ReactNode } from 'react'

interface AuthStepTransitionProps {
  stepKey: string
  children: ReactNode
}

const stepAnimStyle: CSSProperties = {
  opacity: 0,
  filter: 'blur(8px)',
  transform: 'translateY(14px)',
  animation: 'social-rise 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
}

export function AuthStepTransition({ stepKey, children }: AuthStepTransitionProps) {
  return (
    <div key={stepKey} className="flex flex-col gap-7" style={stepAnimStyle}>
      {children}
    </div>
  )
}
