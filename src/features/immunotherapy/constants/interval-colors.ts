export interface IntervalColor {
  bg: string
  text: string
  dot: string
}

export const INTERVAL_COLORS: Record<number, IntervalColor> = {
  7: { bg: '#C3A5E6', text: '#4B2E7A', dot: '#B28BDF' },
  14: { bg: '#E3969E', text: '#8A3E46', dot: '#E3969E' },
  21: { bg: '#B8DF8B', text: '#46661F', dot: '#B8DF8B' },
  28: { bg: '#8BDFDC', text: '#1C5854', dot: '#8BDFDC' },
}

export const DEFAULT_INTERVAL_COLOR: IntervalColor = {
  bg: '#ECEEF1',
  text: '#4A5568',
  dot: '#A0AEC0',
}

export function getIntervalColor(dias: number): IntervalColor {
  return INTERVAL_COLORS[dias] ?? DEFAULT_INTERVAL_COLOR
}
