import { test, expect } from '@playwright/test'
import { API_BASE, apiLogin, credential } from './support'

const aurora = credential('medico.aurora@demo.allervia.local')
const boreal = credential('medico.boreal@demo.allervia.local')

test('identificadores de outra organização nunca respondem 200: paciente, terapia, doses e exportação', async ({
  baseURL,
  page,
}) => {
  const borealApi = await apiLogin(baseURL!, boreal.email, boreal.password)

  const borealPatients = await borealApi.get(`${API_BASE}/patients?pageSize=50`)
  expect(borealPatients.ok()).toBe(true)
  const patientsPage = (await borealPatients.json()) as {
    items: { id: string; fullName: string }[]
  }
  expect(patientsPage.items.length).toBeGreaterThan(0)
  const borealPatientId = patientsPage.items[0].id

  const borealTherapies = await borealApi.get(
    `${API_BASE}/immunotherapies/list?pageSize=50`,
  )
  expect(borealTherapies.ok()).toBe(true)
  const therapiesPage = (await borealTherapies.json()) as {
    items: { id: string }[]
  }
  expect(therapiesPage.items.length).toBeGreaterThan(0)
  const borealTherapyId = therapiesPage.items[0].id
  await borealApi.dispose()

  const auroraApi = await apiLogin(baseURL!, aurora.email, aurora.password)

  const patientRead = await auroraApi.get(
    `${API_BASE}/patients/${borealPatientId}`,
  )
  expect([403, 404]).toContain(patientRead.status())

  const therapyRead = await auroraApi.get(
    `${API_BASE}/immunotherapies/${borealTherapyId}`,
  )
  expect([403, 404]).toContain(therapyRead.status())

  const dosesRead = await auroraApi.get(
    `${API_BASE}/immunotherapies/${borealTherapyId}/doses`,
  )
  expect([403, 404]).toContain(dosesRead.status())

  const asOf = new Date().toISOString()
  const exported = await auroraApi.get(
    `${API_BASE}/immunotherapies/export?asOf=${encodeURIComponent(asOf)}&page=1&pageSize=100&justification=${encodeURIComponent('Verificação e2e de isolamento entre organizações.')}`,
  )
  expect(exported.ok()).toBe(true)
  const exportPage = (await exported.json()) as {
    items: { patient: { id: string; fullName: string } }[]
  }
  expect(
    exportPage.items.filter((row) => row.patient.fullName.includes('Boreal')),
  ).toHaveLength(0)
  expect(
    exportPage.items.filter((row) => row.patient.id === borealPatientId),
  ).toHaveLength(0)
  await auroraApi.dispose()

  await page.goto('/login')
  await page.getByLabel('Email').fill(aurora.email)
  await page.getByPlaceholder('Insira aqui').fill(aurora.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/immunotherapies/)

  await page.goto(`/patient/${borealPatientId}`)
  await expect(page.getByText(patientsPage.items[0].fullName)).toHaveCount(0)
})

test('doses de terapia de outra organização respondem 404 como o restante do prontuário', async ({
  baseURL,
}) => {
  const borealApi = await apiLogin(baseURL!, boreal.email, boreal.password)
  const therapies = (await (
    await borealApi.get(`${API_BASE}/immunotherapies/list?pageSize=50`)
  ).json()) as { items: { id: string }[] }
  await borealApi.dispose()

  const auroraApi = await apiLogin(baseURL!, aurora.email, aurora.password)
  const dosesRead = await auroraApi.get(
    `${API_BASE}/immunotherapies/${therapies.items[0].id}/doses`,
  )
  expect([403, 404]).toContain(dosesRead.status())
  await auroraApi.dispose()
})
