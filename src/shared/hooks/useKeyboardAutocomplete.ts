import { useEffect, useRef, useState } from 'react'

interface UseKeyboardAutocompleteOptions {
  isOpen: boolean
  itemCount: number
  resetKey: unknown
  onSelect: (index: number) => void
  onClose: () => void
}

export function useKeyboardAutocomplete({
  isOpen,
  itemCount,
  resetKey,
  onSelect,
  onClose,
}: UseKeyboardAutocompleteOptions) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [resetKey])

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion-item]')
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || itemCount === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onSelect(highlightedIndex >= 0 ? highlightedIndex : 0)
    } else if (e.key === 'Escape') {
      onClose()
      setHighlightedIndex(-1)
    }
  }

  return { highlightedIndex, setHighlightedIndex, suggestionsRef, handleKeyDown }
}
