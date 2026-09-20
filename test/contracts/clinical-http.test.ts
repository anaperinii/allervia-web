import { beforeAll, expect, it } from 'vitest'

const base = process.env.ALLERVIA_CONTRACT_URL
const token = process.env.ALLERVIA_CONTRACT_TOKEN
const doseId = process.env.ALLERVIA_CONTRACT_DOSE_ID

beforeAll(() => {
  if (!base || !token || !doseId) throw new Error('Run from backend npm run test:contract; fixtures are created only in the guarded test database.')
  const url = new URL(base)
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port) throw new Error('Contract server must be the ephemeral loopback fixture server.')
})

it('refuses an unauthenticated consumer over real HTTP', async () => {
  const response = await fetch(`${base}/doses/${doseId}`)
  expect(response.status).toBe(401)
  const envelope = await response.json()
  expect(envelope).toMatchObject({ statusCode: 401, code: expect.any(String), message: expect.any(String) })
})

it('returns exact configured values and a read-only recommendation', async () => {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const read = await fetch(`${base}/doses/${doseId}`, { headers })
  expect(read.status).toBe(200)
  const dose = await read.json()
  expect(dose.allowedValues).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'low', volume: '0.1' })]))
  expect(dose.revision).toBe(0)
  expect(dose.therapyRevision).toBe(0)
  const preview = await fetch(`${base}/doses/${doseId}/preview`, { method: 'POST', headers, body: JSON.stringify({
    expectedRevision: dose.revision, expectedTherapyRevision: dose.therapyRevision,
    administeredAt: '2026-01-01T13:00:00Z',
    values: { stepId: 'low', concentration: '1000', volume: '0.1', intervalDays: 7 },
  }) })
  expect(preview.status).toBe(200)
  const result = await preview.json()
  expect(result.recommendation.kind).toBe('RECOMMENDED')
  const after = await fetch(`${base}/doses/${doseId}`, { headers })
  expect((await after.json()).revision).toBe(0)
})

it('rejects numeric decimals instead of silently accepting a lossy body', async () => {
  const response = await fetch(`${base}/doses/${doseId}/preview`, { method: 'POST', headers: {
    Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
  }, body: JSON.stringify({ expectedRevision: 0, expectedTherapyRevision: 0,
    administeredAt: '2026-01-01T13:00:00Z', values: { stepId: 'low', concentration: '1000', volume: 0.1, intervalDays: 7 } }) })
  expect(response.status).toBe(400)
})

it('returns only public account fields over HTTP', async () => {
  const response = await fetch(`${base}/account/me`, { headers: { Authorization: `Bearer ${token}` } })
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  const body = await response.json()
  expect(Object.keys(body).sort()).toEqual([
    'capabilities', 'organization', 'professional', 'roles', 'security', 'user',
  ])
  expect(Object.keys(body.user).sort()).toEqual(['createdAt', 'email', 'id', 'isActive', 'type'])
  // A resposta pública não pode carregar credencial, versão de token ou segredo de MFA.
  expect(JSON.stringify(body)).not.toMatch(/password|tokenVersion|secretHash|secretCiphertext/)
  expect(body.security.sessionBased).toBe(false)
  expect(Array.isArray(body.capabilities)).toBe(true)
})

it('prepares an anti-CSRF pre-session for the login form', async () => {
  const response = await fetch(`${base}/auth/csrf`)
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  const cookie = response.headers.get('set-cookie') ?? ''
  expect(cookie).toContain('HttpOnly')
  expect(cookie).toContain('SameSite=Lax')
  expect((await response.json()).csrfToken).toEqual(expect.any(String))
})

it('refuses a cookie-borne command without the synchronizer token', async () => {
  const challenge = await fetch(`${base}/auth/csrf`)
  const cookie = (challenge.headers.get('set-cookie') ?? '').split(';')[0]
  const response = await fetch(`${base}/auth/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie, Origin: base! },
    body: JSON.stringify({ email: 'quem@clinica.com.br', password: 'Senha!Forte#2026' }),
  })
  expect(response.status).toBe(403)
  expect((await response.json()).code).toBe('CSRF_TOKEN_INVALID')
})

it('requires the dedicated password-change flow', async () => {
  const response = await fetch(`${base}/account/update/me`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'ShouldNotBeAccepted1!' }),
  })
  expect(response.status).toBe(400)
})
