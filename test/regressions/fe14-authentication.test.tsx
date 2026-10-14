import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { passwordSchema } from '@/shared/lib/field-schemas'
import { loginSchema } from '@/features/auth/schemas/login'
import { passwordByteLength } from '@/shared/lib/password-rules'
import { acceptSession, apiRequest, clearSession, getSessionContext, setUnauthenticatedHandler } from '@/shared/api/client'
import { endSession, retryEndSession, reauthenticate } from '@/shared/api/auth.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { useReauthenticatedAction } from '@/shared/auth/useReauthenticatedAction'
import { ReauthenticateModal } from '@/features/settings/components/ReauthenticateModal'
import { RecoveryCodesModal } from '@/features/settings/components/RecoveryCodesModal'
import { EnrollMfaFactorModal } from '@/features/settings/components/EnrollMfaFactorModal'
import { stubApi, errorResponse, emptyResponse, jsonResponse } from '../helpers/http'

describe('FE-14 authentication safeguards', () => {
  it.each([
    ['a'.repeat(71), true], ['a'.repeat(72), true], ['a'.repeat(73), false],
    ['é'.repeat(35) + 'a', true], ['é'.repeat(36), true], ['é'.repeat(36) + 'a', false],
    ['😀'.repeat(17) + 'abc', true], ['😀'.repeat(18), true], ['😀'.repeat(18) + 'a', false],
  ])('enforces the UTF-8 byte boundary for %s', (password, accepted) => {
    expect(passwordSchema.safeParse(password).success).toBe(accepted)
    expect(passwordByteLength(password)).toBe(new TextEncoder().encode(password).length)
  })
  it('accepts eight simple characters but does not apply creation rules to an existing login', () => {
    expect(passwordSchema.safeParse('abcdefgh').success).toBe(true)
    expect(passwordSchema.safeParse('😀😀😀😀').success).toBe(false)
    expect(loginSchema.safeParse({ email: 'reader@example.test', password: 'old' }).success).toBe(true)
  })
  it.each(['INVALID_CREDENTIALS', 'MFA_CODE_INVALID'])('keeps the session for a local reauthentication rejection: %s', async code => {
    acceptSession('current', 'csrf')
    const ended = vi.fn()
    setUnauthenticatedHandler(ended)
    stubApi([{ method: 'POST', path: '/auth/reauthenticate', handler: errorResponse(401, code) }])
    await expect(apiRequest('/auth/reauthenticate', { method: 'POST', body: {} })).rejects.toMatchObject({ code })
    expect(getSessionContext()).toBe('current')
    expect(ended).not.toHaveBeenCalled()
  })
  it.each(['SESSION_MISSING', 'SESSION_EXPIRED', 'SESSION_REVOKED', 'SESSION_CONTEXT_CHANGED', 'ACCOUNT_DISABLED', 'ORGANIZATION_DISABLED', 'UNAUTHENTICATED'])('ends the session for an actual authorization rejection: %s', async code => {
    acceptSession('current', 'csrf')
    const ended = vi.fn()
    setUnauthenticatedHandler(ended)
    stubApi([{ method: 'POST', path: '/auth/reauthenticate', handler: errorResponse(401, code) }])
    await expect(apiRequest('/auth/reauthenticate', { method: 'POST', body: {} })).rejects.toMatchObject({ code })
    expect(getSessionContext()).toBeNull()
    expect(ended).toHaveBeenCalledOnce()
  })
  it('does not apply the credential exception to another endpoint', async () => {
    acceptSession('current', 'csrf')
    const ended = vi.fn()
    setUnauthenticatedHandler(ended)
    stubApi([{ path: '/patients', handler: errorResponse(401, 'INVALID_CREDENTIALS') }])
    await expect(apiRequest('/patients')).rejects.toMatchObject({ statusCode: 401 })
    expect(ended).toHaveBeenCalledOnce()
  })
  it('does not accept a malformed successful reauthentication receipt', async () => {
    acceptSession('current', 'csrf')
    stubApi([{ method: 'POST', path: '/auth/reauthenticate', handler: { maxAgeSeconds: 300 } }])
    await expect(reauthenticate({ password: 'private-password' })).rejects.toMatchObject({ code: 'INVALID_API_RESPONSE' })
    expect(getSessionContext()).toBe('current')
  })
  it('cancels a pending sensitive action and consumes a confirmed action only once', async () => {
    acceptSession('current', 'csrf')
    const rejection = new ApiError({ statusCode: 403, code: 'REAUTHENTICATION_REQUIRED', message: 'Confirm identity' })
    const action = vi.fn().mockRejectedValueOnce(rejection).mockResolvedValue(undefined)
    const { result } = renderHook(useReauthenticatedAction)
    await act(async () => { await result.current.run(action) })
    expect(result.current.pending).toBe(true)
    act(() => result.current.cancel())
    await act(async () => { await result.current.resume() })
    expect(action).toHaveBeenCalledTimes(1)
    const second = vi.fn().mockRejectedValueOnce(rejection).mockResolvedValue(undefined)
    await act(async () => { await result.current.run(second) })
    await act(async () => { await Promise.all([result.current.resume(), result.current.resume()]) })
    expect(second).toHaveBeenCalledTimes(2)
  })
  it('does not resume the action after logout or identity replacement', async () => {
    acceptSession('current', 'csrf')
    const action = vi.fn().mockRejectedValue(new ApiError({ statusCode: 403, code: 'REAUTHENTICATION_REQUIRED', message: 'Confirm identity' }))
    const { result } = renderHook(useReauthenticatedAction)
    await act(async () => { await result.current.run(action) })
    clearSession()
    acceptSession('other', 'other-csrf')
    await act(async () => { await result.current.resume() })
    expect(action).toHaveBeenCalledOnce()
  })
  it('discards the sensitive action on unmount', async () => {
    const action = vi.fn().mockRejectedValue(new ApiError({ statusCode: 403, code: 'REAUTHENTICATION_REQUIRED', message: 'Confirm identity' }))
    const { result, unmount } = renderHook(useReauthenticatedAction)
    await act(async () => { await result.current.run(action) })
    unmount()
    await result.current.resume()
    expect(action).toHaveBeenCalledOnce()
  })
  it('clears reauthentication credentials when closed and does not accept a late confirmation', async () => {
    acceptSession('current', 'csrf')
    let finish!: (response: Response) => void
    const success = vi.fn()
    stubApi([{ method: 'POST', path: '/auth/reauthenticate', handler: () => new Promise<Response>(resolve => { finish = resolve }) }])
    const user = userEvent.setup()
    const { rerender } = render(<ReauthenticateModal open requireCode onClose={() => {}} onSuccess={success} />)
    await user.type(screen.getByPlaceholderText('Insira aqui'), 'private-password')
    await user.type(screen.getByPlaceholderText('000000'), '123456')
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    rerender(<ReauthenticateModal open={false} requireCode onClose={() => {}} onSuccess={success} />)
    await act(async () => { finish(jsonResponse({ reauthenticatedAt: '2026-10-13T00:00:00Z', maxAgeSeconds: 300 })) })
    expect(success).not.toHaveBeenCalled()
    rerender(<ReauthenticateModal open requireCode onClose={() => {}} onSuccess={success} />)
    expect(screen.getByPlaceholderText('Insira aqui')).toHaveValue('')
    expect(screen.getByPlaceholderText('000000')).toHaveValue('')
  })
  it('reports clipboard failure and removes recovery codes when the modal closes', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    const { rerender } = render(<RecoveryCodesModal codes={['synthetic-recovery-code']} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível copiar')
    expect(JSON.stringify({ ...localStorage })).not.toContain('synthetic-recovery-code')
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('synthetic-recovery-code')
    rerender(<RecoveryCodesModal codes={null} onClose={() => {}} />)
    expect(screen.queryByText('synthetic-recovery-code')).not.toBeInTheDocument()
  })
  it('supports enrollment retry and confirmation without keeping the secret after confirmation', async () => {
    acceptSession('current', 'csrf')
    const requests = stubApi([

      { method: 'POST', path: '/auth/mfa/enroll', handler: { credentialId: 'factor', secret: 'SYNTHETICSECRET', keyUri: 'otpauth://totp/Test?secret=SYNTHETICSECRET' } },
      { method: 'POST', path: '/auth/mfa/enroll/confirm', times: 1, handler: errorResponse(401, 'MFA_CODE_INVALID') },
      { method: 'POST', path: '/auth/mfa/enroll/confirm', handler: { recoveryCodes: ['synthetic-once'] } },
    ])
    const user = userEvent.setup()
    const { rerender } = render(<EnrollMfaFactorModal open initialEnrollment={{ credentialId: 'factor', secret: 'SYNTHETICSECRET', keyUri: 'otpauth://totp/Test?secret=SYNTHETICSECRET' }} runSensitive={action => action()} onClose={() => {}} onCompleted={() => {}} />)
    expect(await screen.findByText('SYNTHETICSECRET')).toBeInTheDocument()
    const group = screen.getByRole('group', { name: 'Código do aplicativo autenticador' })
    await user.click(group.querySelector('input')!)
    await user.paste('123456')
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: 'Gerar nova chave' }))
    await user.click(screen.getByRole('group', { name: 'Código do aplicativo autenticador' }).querySelector('input')!)
    await user.paste('123456')
    requests.override({ method: 'POST', path: '/auth/mfa/enroll/confirm', handler: { recoveryCodes: ['synthetic-once'] } })
    expect(getSessionContext()).toBe('current')
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(await screen.findByText('synthetic-once')).toBeInTheDocument()
    expect(screen.queryByText('SYNTHETICSECRET')).not.toBeInTheDocument()
    rerender(<EnrollMfaFactorModal open={false} initialEnrollment={{ credentialId: 'factor', secret: 'SYNTHETICSECRET', keyUri: 'otpauth://totp/Test?secret=SYNTHETICSECRET' }} runSensitive={action => action()} onClose={() => {}} onCompleted={() => {}} />)
    expect(screen.queryByText('synthetic-once')).not.toBeInTheDocument()
  })
  it('retries offline logout only against the original session and never a later identity', async () => {
    acceptSession('original', 'csrf')
    const requests = stubApi([
      { path: '/auth/csrf', handler: { csrfToken: 'csrf' } },
      { method: 'POST', path: '/auth/logout', times: 1, handler: () => { throw new TypeError('offline') } },
      { method: 'POST', path: '/auth/logout', handler: emptyResponse() },
    ])
    await expect(endSession()).rejects.toMatchObject({ code: 'NETWORK_UNAVAILABLE' })
    await retryEndSession()
    expect(requests.requestsFor('POST', '/auth/logout')[1].headers).toMatchObject({ 'X-Session-Context': 'original' })
    acceptSession('original', 'csrf')
    requests.override({ method: 'POST', path: '/auth/logout', handler: () => { throw new TypeError('offline') } })
    await expect(endSession()).rejects.toMatchObject({ code: 'NETWORK_UNAVAILABLE' })
    const before = requests.requestsFor('POST', '/auth/logout').length
    acceptSession('later', 'later-csrf')
    await retryEndSession()
    expect(requests.requestsFor('POST', '/auth/logout')).toHaveLength(before)
    expect(getSessionContext()).toBe('later')
  })
})
