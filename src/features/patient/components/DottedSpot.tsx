export function DottedSpot({ className }: { className?: string }) {
  const cols = 16
  const rows = 10
  const gap = 8
  const r = 1.6
  const pad = r + 1
  const width = (cols - 1) * gap + pad * 2
  const height = (rows - 1) * gap + pad * 2
  const maxDist = Math.hypot(cols - 1, rows - 1)
  const dots = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const frac = 1 - Math.hypot(cols - 1 - col, rows - 1 - row) / maxDist
      if (frac < 0.32 && (col + row) % 3 !== 0) continue
      if (frac < 0.58 && (col + row) % 2 !== 0) continue
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={pad + col * gap}
          cy={pad + row * gap}
          r={r}
          fill="#B9D4D7"
          fillOpacity={0.03 + Math.pow(frac, 2.2) * 0.92}
        />,
      )
    }
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      {dots}
    </svg>
  )
}
