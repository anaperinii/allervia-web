export function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export function normalizeForSearch(value: string): string {
  return stripDiacritics(value).toLowerCase()
}

export function matchesSearch(haystack: string, term: string): boolean {
  return normalizeForSearch(haystack).includes(normalizeForSearch(term))
}

export function searchVariants(term: string): string[] {
  const trimmed = term.trim()
  if (!trimmed) return []
  const ascii = stripDiacritics(trimmed)
  return ascii === trimmed ? [trimmed] : [trimmed, ascii]
}
