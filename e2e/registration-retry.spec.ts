import { test, expect } from '@playwright/test'
import { API_BASE, credential, field, login } from './support'

test('existing-patient registration retries an unknown result without editing or duplicating the patient', async ({ page }) => {
  const physician = credential('medico.aurora@demo.allervia.local')
  await login(page, physician.email, physician.password)
  await page.goto('/add-immunotherapy')
  await page.getByPlaceholder('Nome completo').first().fill('Paciente Menor Aurora')
  const detailResponse = page.waitForResponse((response) => /\/patients\/[^/?]+$/.test(new URL(response.url()).pathname) && response.ok())
  await page.getByRole('option', { name: /Paciente Menor Aurora/ }).first().click()
  const patient = await (await detailResponse).json() as { id: string; therapies: { id: string }[] }
  const patientPatches: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'PATCH' && request.url().includes('/patients/')) patientPatches.push(request.url())
  })
  await expect(field(page, /^Telefone\b/)).toHaveAttribute('readonly', '')
  await expect(field(page, /^Peso\b/)).toHaveAttribute('readonly', '')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await field(page, /^Tipo\b/).fill('Ácaros')
  await page.getByPlaceholder(/Der p 60%/).fill('Der p 60% + Der f 40%')
  const version = field(page, /^Versão do protocolo\b/)
  const defaultVersion = await version.locator('option', { hasText: '(padrão)' }).getAttribute('value')
  expect(defaultVersion).toBeTruthy()
  await version.selectOption(defaultVersion!)
  await field(page, /^Etapa inicial\b/).selectOption({ index: 1 })
  const target = field(page, /^Etapa meta\b/)
  await target.selectOption({ index: (await target.locator('option').count()) - 1 })
  await page.getByRole('button', { name: 'Continuar' }).click()

  const commands: { idempotencyKey: string; patientId: string; patient?: unknown }[] = []
  let committedId: string | undefined
  await page.route(/\/immunotherapies\/register$/, async (route) => {
    commands.push(route.request().postDataJSON())
    const response = await route.fetch()
    expect(response.status()).toBe(201)
    const receipt = await response.json() as { immunotherapy: { id: string } }
    if (commands.length === 1) {
      committedId = receipt.immunotherapy.id
      await route.fulfill({ status: 503, json: { statusCode: 503, code: 'RESULT_INDETERMINATE', message: 'Resposta indisponível após gravação no laboratório.' } })
    } else {
      expect(receipt.immunotherapy.id).toBe(committedId)
      await route.fulfill({ response })
    }
  })
  await page.getByRole('button', { name: 'Salvar Prescrição' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page).toHaveURL(/\/add-immunotherapy/)
  await page.getByRole('button', { name: 'Salvar Prescrição' }).click()
  await expect(page).toHaveURL(/\/immunotherapies$/)
  expect(commands).toHaveLength(2)
  expect(commands[1]).toEqual(commands[0])
  expect(commands[0].patientId).toBe(patient.id)
  expect(commands[0].patient).toBeUndefined()
  expect(patientPatches).toEqual([])
  const current = await page.request.get(`${API_BASE}/patients/${patient.id}`)
  expect(current.status()).toBe(200)
  const after = await current.json() as { therapies: { id: string }[] }
  expect(after.therapies).toHaveLength(patient.therapies.length + 1)
  expect(after.therapies.filter((therapy) => therapy.id === committedId)).toHaveLength(1)
})
