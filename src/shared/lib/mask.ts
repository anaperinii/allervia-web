export function maskWithPrefix(value: string, prefixLength = 3): string {
  if (value.length <= prefixLength) return '*'.repeat(Math.max(prefixLength, 3))
  return value.slice(0, prefixLength) + '*'.repeat(Math.max(value.length - prefixLength, 3))
}
