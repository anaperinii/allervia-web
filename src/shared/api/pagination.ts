export interface CollectedPage<T> {
  items: T[]
  total: number
  complete: boolean
  truncated: boolean
}


export function mergeCollectedPages<T>(
  pages: CollectedPage<T>[],
  getId: (item: T) => string,
): CollectedPage<T> {
  const items: T[] = []
  const ids = new Set<string>()
  for (const page of pages) {
    for (const item of page.items) {
      const id = getId(item)
      if (ids.has(id)) continue
      ids.add(id)
      items.push(item)
    }
  }
  return {
    items,
    total: Math.max(items.length, ...pages.map((page) => page.total)),
    complete: pages.every((page) => page.complete),
    truncated: pages.some((page) => page.truncated),
  }
}

export async function collectPages<T>(
  load: (page: number) => Promise<{ items: T[]; total: number; page?: number }>,
  options: { signal?: AbortSignal; maxPages: number; getId?: (item: T) => string },
): Promise<CollectedPage<T>> {
  const items: T[] = []
  const ids = new Set<string>()
  let total: number | undefined
  for (let page = 1; page <= options.maxPages; page++) {
    options.signal?.throwIfAborted()
    const result = await load(page)
    options.signal?.throwIfAborted()
    if (!Number.isSafeInteger(result.total) || result.total < 0 || !Array.isArray(result.items))
      throw new Error('Invalid pagination response')
    if (total !== undefined && total !== result.total)
      throw new Error('Data changed during pagination. Refresh the query.')
    if (result.page !== undefined && result.page !== page) throw new Error('Unexpected pagination page')
    total = result.total
    for (const item of result.items) {
      const id = options.getId ? options.getId(item) : (item as { id: string }).id
      if (typeof id !== 'string' || !id) throw new Error('Missing pagination item identifier')
      if (ids.has(id)) throw new Error('Repeated item during pagination')
      ids.add(id)
      items.push(item)
    }
    if (items.length > total) throw new Error('Pagination total is inconsistent')
    if (items.length === total) return { items, total, complete: true, truncated: false }
    if (result.items.length === 0) throw new Error('Pagination made no progress')
  }
  return { items, total: total ?? 0, complete: false, truncated: true }
}
