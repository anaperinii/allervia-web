import { ApiError } from '@/shared/api/contracts/errors'








export type AppErrorKind = 'chunk' | 'network' | 'api' | 'render'

const CHUNK_SIGNATURES = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'failed to load module script',
  'chunkloaderror',
  'loading chunk',
  'loading css chunk',
]

function messageOf(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return String(error ?? '')
}

export function classifyError(error: unknown): AppErrorKind {
  if (error instanceof ApiError) {
    return error.code === 'NETWORK_UNAVAILABLE' ? 'network' : 'api'
  }
  const text = messageOf(error).toLowerCase()
  if (CHUNK_SIGNATURES.some((signature) => text.includes(signature))) return 'chunk'
  return 'render'
}






export function technicalReference(error: unknown): string {
  if (error instanceof ApiError) {
    return [error.code, error.requestId].filter(Boolean).join(' · ')
  }
  const name = error instanceof Error ? error.name : 'Error'
  return `${name} · ${fingerprint(messageOf(error))}`
}


function fingerprint(value: string): string {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash).toString(36).padStart(6, '0').slice(0, 6).toUpperCase()
}
