export interface IntervalColor {
  bg: string
  text: string
  dot: string
}

export const INTERVAL_COLORS: Record<number, IntervalColor> = {
  7: { bg: '#FDECF0', text: '#E8768E', dot: '#E8768E' },
  14: { bg: '#FDEEE8', text: '#E8766A', dot: '#E8766A' },
  21: { bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB' },
  28: { bg: '#EDE9FE', text: '#7C3AED', dot: '#7C3AED' },
}

export const DEFAULT_INTERVAL_COLOR: IntervalColor = {
  bg: '#F3F4F6',
  text: '#374151',
  dot: '#6B7280',
}

export function getIntervalColor(dias: number): IntervalColor {
  return INTERVAL_COLORS[dias] ?? DEFAULT_INTERVAL_COLOR
}
