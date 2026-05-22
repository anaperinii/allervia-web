type Spot = {
  id: string
  x: number
  y: number
  w: number
  h: number
  color: string
  opacity: number
  animation: string
}

const SPOTS: Spot[] = [
  { id: 'center', x: 50, y: 48, w: 55, h: 72, color: '6, 182, 212',   opacity: 0.45, animation: 'aurora-drift-1 22s ease-in-out infinite' },
  { id: 'tl',     x: 15, y: 20, w: 40, h: 58, color: '20, 184, 166',  opacity: 0.5,  animation: 'aurora-drift-2 26s ease-in-out infinite' },
  { id: 'tc',     x: 50, y: 8,  w: 24, h: 40, color: '127, 255, 212', opacity: 0.4,  animation: 'aurora-drift-3 30s ease-in-out infinite' },
  { id: 'tr',     x: 85, y: 22, w: 36, h: 52, color: '45, 212, 191',  opacity: 0.45, animation: 'aurora-drift-4 24s ease-in-out infinite' },
  { id: 'ml',     x: 8,  y: 60, w: 22, h: 36, color: '8, 145, 178',   opacity: 0.5,  animation: 'aurora-drift-5 28s ease-in-out infinite' },
  { id: 'mr',     x: 92, y: 55, w: 30, h: 42, color: '20, 184, 166',  opacity: 0.45, animation: 'aurora-drift-6 32s ease-in-out infinite' },
  { id: 'bl',     x: 22, y: 82, w: 44, h: 62, color: '6, 182, 212',   opacity: 0.5,  animation: 'aurora-drift-7 20s ease-in-out infinite' },
  { id: 'br',     x: 80, y: 85, w: 35, h: 50, color: '8, 145, 178',   opacity: 0.4,  animation: 'aurora-drift-8 26s ease-in-out infinite' },
]

interface AuroraBackgroundProps {
  fadeBottom?: boolean
}

export function AuroraBackground({ fadeBottom = true }: AuroraBackgroundProps = {}) {
  const maskStyles = fadeBottom
    ? {
        maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
      }
    : {}

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-white"
      style={maskStyles}
      aria-hidden="true"
    >
      {SPOTS.map((spot) => (
        <div
          key={spot.id}
          className="absolute rounded-full blur-3xl"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${spot.w}vmax`,
            height: `${spot.h}vmax`,
            background: `radial-gradient(ellipse at center, rgba(${spot.color}, ${spot.opacity}) 0%, transparent 68%)`,
            animation: spot.animation,
            mixBlendMode: 'multiply',
          }}
        />
      ))}
    </div>
  )
}
