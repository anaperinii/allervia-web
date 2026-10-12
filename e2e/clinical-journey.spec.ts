import { test, expect, type Page } from '@playwright/test'
import {
  API_BASE,
  credential,
  field,
  fillAdministrationWindow,
  generateCpf,
  letterSuffix,
  login,
  pastTimeToday,
  timeToMinutes,
} from './support'

test.describe.configure({ mode: 'serial' })

const physician = credential('medico.aurora@demo.allervia.local')
const patientName = `Paciente E Dois E ${letterSuffix()}`
let firstAdministeredTime = ''

function isoDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function openEvolutionForPatient(page: Page) {
  await page.getByRole('button', { name: 'Evoluir Paciente' }).click()
  await expect(page).toHaveURL(/\/patient-evolution/)
  const search = page.getByRole('combobox', { name: 'Buscar paciente' })
  await search.fill(patientName)
  await page.getByRole('option', { name: new RegExp(patientName) }).click()
  await expect(
    page.getByText('Previsão pendente', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(patientName).first()).toBeVisible()
}

async function fillPreApplication(page: Page, report: string) {
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByPlaceholder('Descreva aqui').fill(report)
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(field(page, /^Valor administrado\b/)).toBeVisible()
}

async function saveEvolution(page: Page) {
  const administerResponse = page.waitForResponse(
    (response) =>
      /\/doses\/[^/]+\/administer$/.test(new URL(response.url()).pathname) &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Salvar Evolução' }).click()
  expect((await administerResponse).status()).toBe(201)
  await expect(page.getByText('Evolução registrada!')).toBeVisible()
  await expect(page).toHaveURL(/\/immunotherapies/)
}

test.describe('jornada clínica: prescrição, evolução prevista e repetição justificada', () => {
  test('wizard de prescrição cria paciente novo, tratamento e primeira previsão', async ({
    page,
  }) => {
    await login(page, physician.email, physician.password)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    await page.clock.setFixedTime(yesterday)
    await page.getByRole('button', { name: 'Adicionar Imunoterapia' }).click()
    await expect(page).toHaveURL(/\/add-immunotherapy/)

    await page.getByPlaceholder('Nome completo').first().fill(patientName)
    await page.getByPlaceholder('000.000.000-00').fill(generateCpf())
    await page.getByPlaceholder('(00) 00000-0000').first().fill('62988887777')
    await field(page, /^Data de Nascimento\b/).fill('1990-06-15')
    await page.getByPlaceholder('Ex: 70.5').fill('70.5')
    await page.getByRole('button', { name: 'Continuar' }).click()

    await expect(field(page, /^Via de Administração\b/)).toHaveValue(
      'Subcutânea (SCIT)',
    )
    await field(page, /^Tipo\b/).fill('Ácaros')
    await field(page, /^Data de Início\b/).fill(isoDay(yesterday))
    await page.getByPlaceholder(/Der p 60%/).fill('Der p 60% + Der f 40%')

    const versionSelect = field(page, /^Versão do protocolo\b/)
    const defaultVersion = await versionSelect
      .locator('option', { hasText: '(padrão)' })
      .getAttribute('value')
    expect(defaultVersion).not.toBeNull()
    await versionSelect.selectOption(defaultVersion!)

    const startingSelect = field(page, /^Etapa inicial\b/)
    await expect(startingSelect.locator('option')).not.toHaveCount(1)
    await startingSelect.selectOption({ index: 1 })
    const targetSelect = field(page, /^Etapa meta\b/)
    const targetCount = await targetSelect.locator('option').count()
    await targetSelect.selectOption({ index: targetCount - 1 })
    await page.getByRole('button', { name: 'Continuar' }).click()

    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`${API_BASE}/immunotherapies/register`) &&
        response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Salvar Prescrição' }).click()
    expect((await registerResponse).status()).toBe(201)
    await expect(page).toHaveURL(/\/immunotherapies/)
  })

  test('evolução administra o valor previsto com horário digitado no TimeSelect', async ({
    page,
  }) => {
    await login(page, physician.email, physician.password)
    await openEvolutionForPatient(page)
    await fillPreApplication(page, 'Sem intercorrências no intervalo (e2e).')

    const stepSelect = field(page, /^Valor administrado\b/)
    const selectedLabel = await stepSelect
      .locator('option:checked')
      .textContent()
    expect(selectedLabel).toContain('(previsto)')

    const time = pastTimeToday('0930')
    firstAdministeredTime = time.expected
    await fillAdministrationWindow(page, time)
    await field(page, /^Executor da aplicação\b/).selectOption({
      label: 'Enfermeira aurora',
    })
    await page.getByRole('button', { name: 'Continuar' }).click()

    await expect(
      page.getByText(/o servidor recomenda como próxima dose/i),
    ).toBeVisible({ timeout: 15_000 })
    await saveEvolution(page)
  })

  test('repetir etapa anterior à prevista exige justificativa e conclui com ela', async ({
    page,
  }) => {
    await login(page, physician.email, physician.password)
    await openEvolutionForPatient(page)
    await fillPreApplication(page, 'Paciente relatou prurido local leve (e2e).')

    const stepSelect = field(page, /^Valor administrado\b/)
    await expect(stepSelect.locator('option:checked')).toContainText(
      '(previsto)',
    )
    const firstOptionLabel = await stepSelect
      .locator('option')
      .nth(1)
      .textContent()
    expect(firstOptionLabel).not.toContain('(previsto)')
    await stepSelect.selectOption({ index: 1 })

    const time = pastTimeToday(
      undefined,
      firstAdministeredTime ? timeToMinutes(firstAdministeredTime) : 1,
    )
    await fillAdministrationWindow(page, time)
    await field(page, /^Executor da aplicação\b/).selectOption({
      label: 'Enfermeira aurora',
    })

    await page.getByRole('button', { name: 'Continuar' }).click()
    await expect(
      page.getByText('Justifique o valor diferente do previsto'),
    ).toBeVisible()
    await expect(field(page, /^Valor administrado\b/)).toBeVisible()

    await field(page, /^Motivo clínico do valor diferente do previsto/).fill(
      'Repetição da etapa anterior por reação local na última aplicação (e2e).',
    )
    const administerRequest = page.waitForRequest(
      (request) =>
        /\/doses\/[^/]+\/administer$/.test(new URL(request.url()).pathname) &&
        request.method() === 'POST',
    )
    await page.getByRole('button', { name: 'Continuar' }).click()
    await saveEvolution(page)

    const body = (await administerRequest).postDataJSON() as {
      reason?: string
    }
    expect(body.reason).toContain('Repetição da etapa anterior')
  })
})
