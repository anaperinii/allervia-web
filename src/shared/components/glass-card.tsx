import { useId } from 'react'

export const GLASS_CARD_SHADOW = [
  '0 10px 32px rgba(15,23,42,0.08)',
  '0 2px 8px rgba(15,23,42,0.04)',
  'inset 0 1.5px 0 rgba(255,255,255,0.95)',
  'inset 0 -1.5px 3px rgba(15,23,42,0.04)',
  'inset 0 0 0 1px rgba(255,255,255,0.55)',
].join(', ')

export function PaperIcon({ size = 48 }: { size?: number }) {
  const backId = useId()
  const frontId = useId()
  const foldId = useId()
  const shadowBackId = useId()
  const shadowFrontId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={backId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead6" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={frontId} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#f0fdfa" />
          <stop offset="0.5" stopColor="#99f6e4" />
          <stop offset="1" stopColor="#5eead6" />
        </linearGradient>
        <linearGradient id={foldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0fdfa" />
          <stop offset="1" stopColor="#ccfbf1" />
        </linearGradient>
        <filter id={shadowBackId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f766e" floodOpacity="0.30" />
        </filter>
        <filter id={shadowFrontId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="11" floodColor="#0d9488" floodOpacity="0.32" />
        </filter>
      </defs>
      <g filter={`url(#${shadowBackId})`}>
        <rect x="52" y="46" width="80" height="104" rx="17" fill={`url(#${backId})`} />
      </g>
      <g filter={`url(#${shadowFrontId})`}>
        <path
          d="M 87 60 L 132 60 L 158 86 L 158 151 Q 158 164 145 164 L 87 164 Q 74 164 74 151 L 74 73 Q 74 60 87 60 Z"
          fill={`url(#${frontId})`}
          fillOpacity="0.72"
        />
        <path
          d="M 131 60 L 158 86 L 138 86 Q 131 86 131 79 Z"
          fill={`url(#${foldId})`}
          fillOpacity="0.9"
        />
      </g>
      <g fill="#ffffff" opacity="0.92">
        <rect x="90" y="106" width="30" height="8" rx="4" />
        <rect x="90" y="126" width="20" height="8" rx="4" />
      </g>
    </svg>
  )
}

export function TickIcon({ size = 44, variant = 'teal' }: { size?: number; variant?: 'teal' | 'aqua' }) {
  const backId = useId()
  const frontId = useId()
  const shadowBackId = useId()
  const shadowFrontId = useId()
  const c =
    variant === 'aqua'
      ? { backA: '#5eead6', backB: '#14b8a6', frontA: '#f0fdfa', frontB: '#99f6e4', frontC: '#5eead6', shadowBack: '#0f766e', shadowFront: '#0d9488' }
      : { backA: '#9BC1C4', backB: '#4d7e85', frontA: '#EAF1F1', frontB: '#9BC1C4', frontC: '#6C9EA5', shadowBack: '#4d7e85', shadowFront: '#6C9EA5' }
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={backId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.backA} />
          <stop offset="1" stopColor={c.backB} />
        </linearGradient>
        <linearGradient id={frontId} x1="0.1" y1="0.05" x2="0.9" y2="1">
          <stop offset="0" stopColor={c.frontA} />
          <stop offset="0.45" stopColor={c.frontB} />
          <stop offset="1" stopColor={c.frontC} />
        </linearGradient>
        <filter id={shadowBackId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor={c.shadowBack} floodOpacity="0.30" />
        </filter>
        <filter id={shadowFrontId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor={c.shadowFront} floodOpacity="0.32" />
        </filter>
      </defs>
      <g filter={`url(#${shadowBackId})`} transform="rotate(9 132 72)">
        <rect x="86" y="26" width="92" height="92" rx="26" fill={`url(#${backId})`} />
      </g>
      <g filter={`url(#${shadowFrontId})`}>
        <rect x="40" y="52" width="104" height="104" rx="30" fill={`url(#${frontId})`} fillOpacity="0.72" />
      </g>
      <path
        d="M 76 103 L 88 115 L 110 88"
        fill="none"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
