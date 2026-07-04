interface AllerviaLogoProps {
  size?: number
  color?: string
  withWordmark?: boolean
  wordmarkColor?: string
  className?: string
}

const DOTS = [
  { x: -11, y: -22, r: 1.7 }, { x: 0, y: -22, r: 2.3 }, { x: 11, y: -22, r: 1.7 },
  { x: -22, y: -11, r: 1.7 }, { x: -11, y: -11, r: 2.9 }, { x: 0, y: -11, r: 3.5 }, { x: 11, y: -11, r: 2.9 }, { x: 22, y: -11, r: 1.7 },
  { x: -22, y: 0, r: 2.3 }, { x: -11, y: 0, r: 3.5 }, { x: 0, y: 0, r: 4.3 }, { x: 11, y: 0, r: 3.5 }, { x: 22, y: 0, r: 2.3 },
  { x: -22, y: 11, r: 1.7 }, { x: -11, y: 11, r: 2.9 }, { x: 0, y: 11, r: 3.5 }, { x: 11, y: 11, r: 2.9 }, { x: 22, y: 11, r: 1.7 },
  { x: -11, y: 22, r: 1.7 }, { x: 0, y: 22, r: 2.3 }, { x: 11, y: 22, r: 1.7 },
]

// Furthest dots sit at (±22, ±11) → hypot ≈ 24.6. Used to fade dots from a
// strong center peak out to lighter tips.
const MAX_DOT_DISTANCE = Math.hypot(22, 11)

export function AllerviaLogo({
  size = 56,
  color = '#6C9EA5',
  withWordmark = false,
  wordmarkColor = '#DCE1E5',
  className,
}: AllerviaLogoProps) {
  const viewBox = withWordmark ? '0 0 220 80' : '0 0 70 70'
  return (
    <svg
      width={withWordmark ? size * 3 : size}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Allervia"
    >
      <g fill={color} transform={withWordmark ? 'translate(35 40)' : 'translate(35 35)'}>
        {DOTS.map((d, i) => {
          const distance = Math.hypot(d.x, d.y)
          const fillOpacity = 1 - (distance / MAX_DOT_DISTANCE) * 0.5
          return <circle key={i} cx={d.x} cy={d.y} r={d.r} fillOpacity={fillOpacity} />
        })}
      </g>
      {withWordmark && (
        <text
          x="80"
          y="50"
          fill={wordmarkColor}
          fontFamily="Manrope, sans-serif"
          fontSize="26"
          fontWeight="600"
          letterSpacing="3"
        >
          ALLERVIA
        </text>
      )}
    </svg>
  )
}
