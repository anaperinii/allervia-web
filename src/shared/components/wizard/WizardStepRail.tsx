const RAIL_R = 470
const RAIL_STEP_ANGLE = 17
const RAIL_BASE_LEFT = 44
const RAIL_FADE = 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)'

interface WizardStepRailProps {
  current: number
  labels: string[]
  descriptions: string[]
  onSelect: (i: number) => void
}

export function WizardStepRail({ current, labels, descriptions, onSelect }: WizardStepRailProps) {
  return (
    <div
      className="pointer-events-none fixed inset-y-0 right-0 z-0 w-108 overflow-hidden"
      style={{ WebkitMaskImage: RAIL_FADE, maskImage: RAIL_FADE }}
    >
      {/* dial circle — bulges to the right, active point on the left */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full border"
        style={{
          width: RAIL_R * 2,
          height: RAIL_R * 2,
          left: RAIL_BASE_LEFT,
          top: '50%',
          transform: 'translateY(-50%)',
          borderColor: 'rgba(16,60,68,0.18)',
        }}
      />

      {labels.map((label, i) => {
        const active = i === current
        const rel = i - current
        const ang = ((180 + rel * RAIL_STEP_ANGLE) * Math.PI) / 180
        const dx = RAIL_R * (Math.cos(ang) + 1)
        const dy = -RAIL_R * Math.sin(ang)
        const clickable = rel < 0
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(i)}
            className="pointer-events-auto absolute flex -translate-y-1/2 items-center gap-3 border-none bg-transparent p-0 text-left transition-all duration-650 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              left: RAIL_BASE_LEFT + dx,
              top: `calc(50% + ${dy}px)`,
              cursor: clickable ? 'pointer' : 'default',
            }}
          >
            <span
              className="shrink-0 rounded-full"
              style={{
                width: active ? 12 : 6,
                height: active ? 12 : 6,
                marginLeft: -4,
                background: active ? '#257E8C' : 'rgba(16,60,68,0.2)',
                boxShadow: active ? '0 0 0 5px rgba(37,126,140,0.12)' : 'none',
              }}
            />
            <span
              className="tabular-nums leading-none"
              style={{
                fontSize: active ? '3.6rem' : '2.1rem',
                fontWeight: active ? 600 : 500,
                letterSpacing: '-0.04em',
                marginLeft: 6,
                opacity: active ? 1 : 0.6,
                color: active ? '#257E8C' : '#9aa6a8',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="ml-2.5 whitespace-nowrap" style={{ opacity: active ? 1 : 0.55 }}>
              <div className="text-sm font-bold" style={{ color: active ? 'var(--text)' : '#9aa6a8' }}>{label}</div>
              <div className="mt-0.5 text-[0.72rem]" style={{ color: active ? 'var(--text-muted)' : '#9aa6a8' }}>{descriptions[i]}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
