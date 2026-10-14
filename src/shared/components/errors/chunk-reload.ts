const RELOAD_GUARD_KEY = 'allervia:chunk-reload'


export function chunkReloadAlreadyUsed(): boolean {
  try {
    return window.sessionStorage.getItem(RELOAD_GUARD_KEY) === 'done'
  } catch {
    return false
  }
}

export function reloadForChunkFailureOnce(): void {
  if (chunkReloadAlreadyUsed()) return
  try {
    window.sessionStorage.setItem(RELOAD_GUARD_KEY, 'done')
  } catch {
    void 0
  }
  window.location.reload()
}

export function clearChunkReloadGuard(): void {
  try {
    window.sessionStorage.removeItem(RELOAD_GUARD_KEY)
  } catch {
    void 0
  }
}
