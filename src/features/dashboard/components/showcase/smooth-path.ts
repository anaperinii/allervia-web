export interface Point {
  x: number
  y: number
}

/**
 * Catmull-Rom through the points, emitted as cubic beziers. Gives the reference
 * chart's soft S-curve without pulling in a charting library for one line.
 */
export function smoothPath(points: Point[], tension = 0.22): string {
  if (points.length < 2) return ''

  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const c1x = p1.x + (p2.x - p0.x) * tension
    const c1y = p1.y + (p2.y - p0.y) * tension
    const c2x = p2.x - (p3.x - p1.x) * tension
    const c2y = p2.y - (p3.y - p1.y) * tension

    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`
  }
  return d
}
