import { beforeAll, expect, it } from 'vitest'

const base = process.env.ALLERVIA_CONTRACT_URL
const cookie = process.env.ALLERVIA_CONTRACT_COOKIE
const context = process.env.ALLERVIA_CONTRACT_SESSION_ID
const csrf = process.env.ALLERVIA_CONTRACT_CSRF
const authHeaders = () => ({ Cookie: cookie!, Origin: base!, 'X-CSRF-Token': csrf!, 'X-Session-Context': context! })
const doseId = process.env.ALLERVIA_CONTRACT_DOSE_ID
const patientId = process.env.ALLERVIA_CONTRACT_PATIENT_ID
const physicianId = process.env.ALLERVIA_CONTRACT_PHYSICIAN_ID

beforeAll(() => {
  if (!base || !cookie || !context || !csrf || !doseId || !patientId || !physicianId) throw new Error('Run from backend npm run test:contract; fixtures are created only in the guarded test database.')
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
  const headers = { ...authHeaders(), 'Content-Type': 'application/json' }
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
    ...authHeaders(), 'Content-Type': 'application/json',
  }, body: JSON.stringify({ expectedRevision: 0, expectedTherapyRevision: 0,
    administeredAt: '2026-01-01T13:00:00Z', values: { stepId: 'low', concentration: '1000', volume: 0.1, intervalDays: 7 } }) })
  expect(response.status).toBe(400)
})

it('returns only public account fields over HTTP', async () => {
  const response = await fetch(`${base}/account/me`, { headers: { ...authHeaders() } })
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  const body = await response.json()
  expect(Object.keys(body).sort()).toEqual([
    'capabilities', 'organization', 'professional', 'roles', 'security', 'user',
  ])
  expect(Object.keys(body.user).sort()).toEqual(['createdAt', 'email', 'id', 'isActive', 'type'])
  expect(JSON.stringify(body)).not.toMatch(/password|tokenVersion|secretHash|secretCiphertext/)
  expect(body.security.sessionBased).toBe(true)
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
  const retired = await fetch(`${base}/account/update/me`, {
    method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'ShouldNotBeAccepted1!' }),
  })
  expect(retired.status).toBe(404)

  const profile = await fetch(`${base}/professionals/me`, {
    method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'ShouldNotBeAccepted1!' }),
  })
  expect(profile.status).toBe(400)
  expect((await profile.json()).code).toBe('VALIDATION_ERROR')
})

it('paginates the team listing within the caller organization', async () => {
  const response = await fetch(`${base}/professionals?page=1&pageSize=5`, {
    headers: { ...authHeaders() },
  })
  expect(response.status).toBe(200)
  const page = await response.json()
  expect(page).toMatchObject({ page: 1, pageSize: 5, total: expect.any(Number) })
  expect(Array.isArray(page.items)).toBe(true)
  expect(JSON.stringify(page)).not.toMatch(/password|tokenVersion|secretHash/)
})

it('keeps organization provisioning out of the product surface', async () => {
  const response = await fetch(`${base}/organization/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Clínica Não Autorizada', taxId: '12345678000199' }),
  })
  expect(response.status).toBe(404)
})

it('accepts every editable patient field declared by the regenerated schema', async () => {
  const headers = { ...authHeaders(), 'Content-Type': 'application/json' }
  const response = await fetch(`${base}/patients/update/${patientId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      fullName: 'Paciente de contrato',
      birthDate: '1990-01-02',
      weightInKg: 71,
      phoneNumber: '11988887777',
      responsiblePhysicianId: physicianId,
      guardian: null,
    }),
  })
  expect(response.status).toBe(200)

  const read = await fetch(`${base}/patients/${patientId}`, { headers: authHeaders() })
  expect(read.status).toBe(200)
  const patient = await read.json()
  expect(patient).toMatchObject({
    fullName: 'Paciente de contrato',
    weightInKg: 71,
    phoneNumber: '11988887777',
    guardian: null,
  })
})

it('still validates the patient payload after the schema change', async () => {
  const response = await fetch(`${base}/patients/update/${patientId}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '123', weightInKg: 0 }),
  })
  expect(response.status).toBe(400)
  expect((await response.json()).code).toBe('VALIDATION_ERROR')
})

it('returns an authorized complete clinical record with observations and immutable addenda', async () => {
  const response = await fetch(`${base}/immunotherapies/record/${patientId}`, { headers: authHeaders() })
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  const body = await response.json()
  expect(body).toMatchObject({ complete: true, patient: { id: patientId }, asOf: expect.any(String) })
  expect(body.therapies.length).toBeGreaterThan(0)
  expect(body.therapies[0].doses[0]).toMatchObject({ observations: expect.any(Array), observationAddenda: expect.any(Array) })
  expect(JSON.stringify(body)).not.toMatch(/passwordHash|secretCiphertext|sessionSecret/)
})

it('returns bounded historical buckets and rejects an invalid clinical timezone over real HTTP', async () => {
  const query = 'from=2026-01-01&to=2026-12-31&timeZone=America%2FSao_Paulo&granularity=month'
  const response = await fetch(`${base}/immunotherapies/status-history?${query}`, { headers: authHeaders() })
  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body).toMatchObject({ complete: true, timeZone: 'America/Sao_Paulo', totalTherapies: 1 })
  expect(body.buckets.length).toBeGreaterThan(0)
  expect(body.buckets[0]).toMatchObject({ active: expect.any(Number), unknown: expect.any(Number) })
  const invalid = await fetch(`${base}/immunotherapies/status-history?${query.replace('America%2FSao_Paulo', 'Invalid%2FZone')}`, { headers: authHeaders() })
  expect(invalid.status).toBe(400)
  expect((await invalid.json()).code).toBe('INVALID_TIME_ZONE')
})

it('returns a local credential code for a wrong current password without revoking the actual session', async () => {
  const response = await fetch(base + '/account/me/password', { method: 'POST', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: 'intentionally-wrong-current-password', newPassword: 'abcdefgh' }) })
  expect(response.status).toBe(401)
  expect((await response.json()).code).toBe('INVALID_CREDENTIALS')
  expect((await fetch(base + '/auth/session', { headers: authHeaders() })).status).toBe(200)
})

it('restores with the cookie and immediately denies all protected reads after logout', async () => {
  const read = await fetch(base + '/auth/session', { headers: authHeaders() })
  expect(read.status).toBe(200)
  const body = await read.json()
  expect(body).not.toHaveProperty('accessToken')
  expect(body).not.toHaveProperty('sessionSecret')
  expect(body.session.id).toBe(context)
  const logout = await fetch(base + '/auth/logout', { method: 'POST', headers: {
    ...authHeaders(), 'Content-Type': 'application/json',
  }, body: '{}' })
  expect(logout.status).toBe(204)
  expect((await fetch(base + '/account/me', { headers: authHeaders() })).status).toBe(401)
  expect((await fetch(base + '/doses/' + doseId, { headers: authHeaders() })).status).toBe(401)
})
