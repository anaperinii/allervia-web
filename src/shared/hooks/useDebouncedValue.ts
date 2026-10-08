import { useEffect, useState } from 'react'

/**
 * Atrasa a propagação de um valor até ele ficar estável pelo intervalo dado.
 * Útil para campos de busca que alimentam chaves de query.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
