import { test, expect } from '@playwright/test'
import {
  API_BASE,
  credential,
  field,
  fillAdministrationWindow,
  login,
  pastTimeToday,
  timeToMinutes,
  uniqueSuffix,
} from './support'

test.describe.configure({ mode: 'serial' })

const physician = credential('medico.aurora@demo.allervia.local')
const ADMINISTER_PATTERN = /\/doses\/[^/]+\/administer$/

interface DoseRecordLite {
  id: string
  administeredAt: string | null
  betweenDosesReport: string | null
}

test('resposta perdida após o commit: retry idempotente devolve o resultado original e grava uma única aplicação', async ({
  page,
}) => {
  const reportMarker = `Rede caiu após o commit (e2e ${uniqueSuffix()}).`

  await login(page, physician.email, physician.password)

  const listResponse = await page.request.get(
    `${API_BASE}/immunotherapies/list?pageSize=50&status=IN_PROGRESS&search=${encodeURIComponent('Paciente Menor Aurora')}`,
  )
  expect(listResponse.ok()).toBe(true)
  const list = (await listResponse.json()) as {
    items: { id: string; patient: { fullName: string } }[]
  }
  const therapy = list.items.find(
    (item) => item.patient.fullName === 'Paciente Menor Aurora',
  )
  expect(therapy).toBeDefined()

  const dosesBefore = (await (
    await page.request.get(`${API_BASE}/immunotherapies/${therapy!.id}/doses`)
  ).json()) as DoseRecordLite[]
  const administeredBefore = dosesBefore.filter(
    (dose) => dose.administeredAt !== null,
  ).length
  const latestAdministered = dosesBefore
    .map((dose) => dose.administeredAt)
    .filter((value): value is string => value !== null)
    .sort()
    .at(-1)
  const latestDate = latestAdministered ? new Date(latestAdministered) : null
  const minMinutes =
    latestDate && latestDate.toDateString() === new Date().toDateString()
      ? latestDate.getHours() * 60 + latestDate.getMinutes()
      : 1

  await page.goto(`/patient-evolution?therapy=${therapy!.id}`)
  await expect(page.getByText('Previsão pendente')).toBeVisible()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByPlaceholder('Descreva aqui').fill(reportMarker)
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(field(page, /^Valor administrado\b/)).toBeVisible()
  const time = pastTimeToday(undefined, minMinutes)
  expect(timeToMinutes(time.expected)).toBeGreaterThanOrEqual(minMinutes)
  await fillAdministrationWindow(page, time)
  await field(page, /^Executor da aplicação\b/).selectOption({
    label: 'Enfermeira aurora',
  })
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(
    page.getByText(/o servidor recomenda como próxima dose/i),
  ).toBeVisible({ timeout: 15_000 })

  let serverCommitStatus = 0
  await page.route(ADMINISTER_PATTERN, async (route) => {
    const serverResponse = await route.fetch()
    serverCommitStatus = serverResponse.status()
    await route.abort('failed')
  })
  await page.getByRole('button', { name: 'Salvar Evolução' }).click()

  await expect(page.getByText('Sem conexão')).toBeVisible({ timeout: 15_000 })
  await expect(page).toHaveURL(/\/patient-evolution/)
  expect(serverCommitStatus).toBe(201)

  await page.unroute(ADMINISTER_PATTERN)
  const retryResponse = page.waitForResponse(
    (response) =>
      ADMINISTER_PATTERN.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Salvar Evolução' }).click()
  expect((await retryResponse).status()).toBe(201)
  await expect(page.getByText('Evolução registrada!')).toBeVisible()
  await expect(page).toHaveURL(/\/immunotherapies/)

  const dosesAfter = (await (
    await page.request.get(`${API_BASE}/immunotherapies/${therapy!.id}/doses`)
  ).json()) as DoseRecordLite[]
  const administeredAfter = dosesAfter.filter(
    (dose) => dose.administeredAt !== null,
  )
  expect(administeredAfter.length).toBe(administeredBefore + 1)
  expect(
    dosesAfter.filter((dose) => dose.betweenDosesReport === reportMarker)
      .length,
  ).toBe(1)
  expect(
    dosesAfter.filter(
      (dose) =>
        dose.betweenDosesReport === reportMarker &&
        dose.administeredAt !== null,
    ).length,
  ).toBe(1)
})
