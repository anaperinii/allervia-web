// Design tokens for the app shell and every page inside it: a flat canvas,
// near-white cards, deep teal where the reference used black, and the system
// teal as the single accent (it replaced the reference's lime).
export const SHOWCASE = {
  canvas: '#EBEEEE',
  card: '#F6F8F8',
  cardInner: '#EDF1F1',
  cardInnerStrong: '#E3E9E9',
  ink: '#12333a',
  inkSoft: '#4A6469',
  muted: '#8CA1A6',
  line: '#DDE6E6',
  /** Accent for badges, active bars and highlights. */
  accent: '#257E8C',
  /** Text/icon colour that sits on top of `accent`. */
  onAccent: '#FFFFFF',
  /** Lighter accent for large fills that carry dark text. */
  accentSoft: '#74C3B9',
  /** Alert red — unread counters and destructive markers. */
  danger: '#E0453C',
  brand: '#6C9EA5',
  white: '#FFFFFF',
} as const
