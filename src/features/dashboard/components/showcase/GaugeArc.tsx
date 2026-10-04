import type { ReactNode } from 'react'
import { SHOWCASE } from '@/shared/components/showcase'

const VIEW_W = 220
const VIEW_H = 124
const RADIUS = 100
const STROKE = 16
const CENTER_X = VIEW_W / 2
const BASELINE = 110
const ARC = `M${CENTER_X - RADIUS},${BASELINE} A${RADIUS},${RADIUS} 0 0 1 ${CENTER_X + RADIUS},${BASELINE}`
const SEMICIRCLE = Math.PI * RADIUS
const ARC_GRADIENT_ID = 'gauge-arc-gradient'

interface GaugeArcProps {
  /** Fração preenchida, 0–1. */
  ratio: number
  /** Valor em destaque no centro do arco. */
  value: string
  /** Legenda curta acima do valor. */
  caption?: string
  /** Rótulo discreto abaixo do valor. */
  footnote?: string
  ariaLabel: string
  children?: ReactNode
}

/** Arco semicircular de progresso — magnitude única, leitura imediata. */
export function GaugeArc({ ratio, value, caption, footnote, ariaLabel, children }: GaugeArcProps) {
  const clamped = Math.max(0, Math.min(ratio, 1))

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[21rem]">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          style={{ overflow: 'visible' }}
          role="img"
          aria-label={ariaLabel}
        >
          <defs>
            {/* Degradê acompanha o arco da esquerda para a direita: tom claro no
                início do preenchimento, tom cheio da marca no fim. */}
            <linearGradient id={ARC_GRADIENT_ID} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={SHOWCASE.accentSoft} />
              <stop offset="55%" stopColor={SHOWCASE.accent} />
              <stop offset="100%" stopColor={SHOWCASE.ink} />
            </linearGradient>
          </defs>
          <path d={ARC} fill="none" stroke={SHOWCASE.cardInnerStrong} strokeWidth={STROKE} strokeLinecap="round" />
          <path
            d={ARC}
            fill="none"
            stroke={`url(#${ARC_GRADIENT_ID})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${SEMICIRCLE * clamped} ${SEMICIRCLE}`}
          />
        </svg>

        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center gap-1">
          {caption && (
            <span className="text-[0.68rem] font-medium" style={{ color: SHOWCASE.muted }}>
              {caption}
            </span>
          )}
          <span
            className="text-[2.6rem] font-medium leading-none tracking-tight tabular-nums"
            style={{ color: SHOWCASE.ink }}
          >
            {value}
          </span>
          {footnote && (
            <span
              className="text-[0.66rem] font-semibold uppercase tracking-wide"
              style={{ color: SHOWCASE.muted }}
            >
              {footnote}
            </span>
          )}
        </div>
      </div>

      {children && <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">{children}</div>}
    </div>
  )
}

/** Tag com valor e rótulo — mesma linguagem das tags SCIT/SLIT. */
export function GaugeLegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-medium leading-none"
      style={{ background: `${color}26`, border: `1px solid ${color}`, color: SHOWCASE.ink }}
    >
      <span className="font-bold tabular-nums">{value}</span>
      {label}
    </span>
  )
}
