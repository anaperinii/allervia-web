import { afterEach, describe, expect, it, vi } from 'vitest'
import { acceptSession, apiRequest, clearSession, setUnauthenticatedHandler } from '@/shared/api/client'
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status})
afterEach(() => { clearSession(); setUnauthenticatedHandler(null); vi.unstubAllGlobals() })
describe('Opaque session client', () => {
  it('sends cookie credentials and session-bound CSRF without a bearer', async () => {
    acceptSession('session-id', 'csrf')
    const fetchMock = vi.fn().mockResolvedValue(json({ok:true}))
    vi.stubGlobal('fetch', fetchMock)
    await apiRequest('/doses/example/administer', {method:'POST', body:{commandId:'same-command'}})
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.credentials).toBe('include')
    expect(options.headers).toMatchObject({'X-CSRF-Token':'csrf','X-Session-Context':'session-id'})
    expect(options.headers).not.toHaveProperty('Authorization')
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
  it.each([401,403,429,500])('does not renew or repeat commands on %i', async status => {
    const fetchMock=vi.fn().mockResolvedValue(json({code:'REJECTED',message:'no'},status))
    vi.stubGlobal('fetch',fetchMock)
    await expect(apiRequest('/doses/example/administer',{method:'POST',body:{}})).rejects.toMatchObject({statusCode:status})
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('discards responses after an identity change', async () => {
    let finish!: (r:Response)=>void
    vi.stubGlobal('fetch', vi.fn(()=>new Promise<Response>(resolve=>{finish=resolve})))
    acceptSession('old','csrf')
    const pending=apiRequest('/patients')
    clearSession(); acceptSession('new','other-csrf')
    finish(json({private:'old-account'}))
    await expect(pending).rejects.toMatchObject({name:'AbortError'})
  })
  it('does not replay on uncertain network errors', async () => {
    const fetchMock=vi.fn().mockRejectedValue(new TypeError('offline')); vi.stubGlobal('fetch',fetchMock)
    await expect(apiRequest('/doses/example/administer',{method:'POST',body:{}})).rejects.toMatchObject({statusCode:0})
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
