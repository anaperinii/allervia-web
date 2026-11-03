import { collectPages, mergeCollectedPages, type CollectedPage } from '@/shared/api/pagination'
import { matchesSearch, searchVariants } from '@/shared/lib/search-terms'

interface AccentTolerantSearchOptions<T> {
  term: string
  load: (page: number, search: string | undefined) => Promise<{ items: T[]; total: number; page?: number }>
  getId: (item: T) => string
  /** Fields compared locally when the server finds nothing for the typed term. */
  getSearchableText: (item: T) => string
  signal?: AbortSignal
  maxPages?: number
}

/**
 * Searches the server with the term as typed and, when it carries accents, with
 * the unaccented spelling too. If neither returns anything, falls back to a
 * local, accent-insensitive filter over the unfiltered list — so "jose" finds
 * "José" even when the backend compares accents strictly.
 */
export async function collectAccentTolerantPages<T>({
  term,
  load,
  getId,
  getSearchableText,
  signal,
  maxPages = 5,
}: AccentTolerantSearchOptions<T>): Promise<CollectedPage<T>> {
  const variants = searchVariants(term)

  const pages = await Promise.all(
    (variants.length > 0 ? variants : [undefined]).map((variant) =>
      collectPages((page) => load(page, variant), { signal, maxPages, getId }),
    ),
  )
  const merged = mergeCollectedPages(pages, getId)
  if (merged.items.length > 0 || variants.length === 0) return merged

  const unfiltered = await collectPages((page) => load(page, undefined), {
    signal,
    maxPages,
    getId,
  })
  const items = unfiltered.items.filter((item) => matchesSearch(getSearchableText(item), term))
  return { ...unfiltered, items, total: Math.max(items.length, unfiltered.total) }
}
