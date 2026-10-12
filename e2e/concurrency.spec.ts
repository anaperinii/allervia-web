import { test, expect, type Page } from '@playwright/test'
import {
  API_BASE,
  apiLogin,
  credential,
  field,
  localOffsetIso,
  login,
  todayIso,
  uniqueSuffix,
} from './support'

test.describe.configure({ mode: 'serial' })

const physician = credential('medico.aurora@demo.allervia.local')

async function createAppointment(page: Page, title: string, startTime: string) {
  await page.goto('/appointments')
  await page.getByRole('button', { name: 'Novo agendamento' }).click()
  const dialog = page.getByRole('dialog')
  await expect(
    dialog.getByRole('heading', { name: 'Novo agendamento' }),
  ).toBeVisible()
  await dialog
    .getByPlaceholder('Buscar paciente por nome')
    .fill('Paciente Adulto Aurora')
  await page.getByRole('option', { name: /Paciente Adulto Aurora/ }).click()
  await field(dialog, /^Data\b/).fill(todayIso())
  await field(dialog, /^Início\b/).fill(startTime)
  await field(dialog, /^Título\b/).fill(title)
  const created = page.waitForResponse(
    (response) =>
      response.url().includes(`${API_BASE}/appointments`) &&
      response.request().method() === 'POST',
  )
  await dialog.getByRole('button', { name: 'Agendar compromisso' }).click()
  expect((await created).status()).toBe(201)
  await expect(page.getByText('Compromisso agendado!')).toBeVisible()
}

async function openManageTab(page: Page, title: string) {
  await page.goto('/appointments')
  await page.getByText(title).first().click()
  const dialog = page.getByRole('dialog', { name: 'Detalhes do compromisso' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Editar' }).click()
  await expect(field(dialog, /^Título\b/)).toBeVisible()
  return dialog
}

test.describe('concorrência e troca de sessão', () => {
  test('edição concorrente do mesmo agendamento: o segundo salvar recebe conflito explícito sem sobrescrever', async ({
    browser,
    baseURL,
  }) => {
    const title = `Compromisso E2E ${uniqueSuffix()}`

    const contextA = await browser.newContext()
    const pageA = await contextA.newPage()
    await login(pageA, physician.email, physician.password)
    await createAppointment(pageA, title, '23:00')

    const contextB = await browser.newContext()
    const pageB = await contextB.newPage()
    await login(pageB, physician.email, physician.password)

    const dialogA = await openManageTab(pageA, title)
    const dialogB = await openManageTab(pageB, title)

    await field(dialogA, /^Observações\b/).fill('Observação gravada pela aba A.')
    const savedA = pageA.waitForResponse(
      (response) =>
        response.url().includes(`${API_BASE}/appointments/`) &&
        response.request().method() === 'PATCH',
    )
    await dialogA.getByRole('button', { name: 'Confirmar' }).click()
    expect((await savedA).ok()).toBe(true)
    await expect(pageA.getByText('Compromisso atualizado')).toBeVisible()

    const titleB = `${title} (edição B)`
    await field(dialogB, /^Título\b/).fill(titleB)
    const savedB = pageB.waitForResponse(
      (response) =>
        response.url().includes(`${API_BASE}/appointments/`) &&
        response.request().method() === 'PATCH',
    )
    await dialogB.getByRole('button', { name: 'Confirmar' }).click()
    expect((await savedB).status()).toBe(409)
    await expect(pageB.getByText('Ação não permitida agora')).toBeVisible()
    await expect(dialogB).toBeVisible()
    await expect(field(dialogB, /^Título\b/)).toHaveValue(titleB)

    const api = await apiLogin(baseURL!, physician.email, physician.password)
    const from = encodeURIComponent(localOffsetIso(todayIso(), '00:00'))
    const to = encodeURIComponent(localOffsetIso(todayIso(), '23:59'))
    const listed = await api.get(
      `${API_BASE}/appointments?from=${from}&to=${to}&pageSize=100`,
    )
    expect(listed.ok()).toBe(true)
    const { items } = (await listed.json()) as {
      items: { title: string | null; notes: string | null }[]
    }
    const persisted = items.find((item) => item.title === title)
    expect(persisted).toBeDefined()
    expect(persisted!.notes).toBe('Observação gravada pela aba A.')
    expect(items.find((item) => item.title === titleB)).toBeUndefined()
    await api.dispose()

    await contextA.close()
    await contextB.close()
  })

  test('logout em outra aba bloqueia a confirmação de formulário aberto sem persistir efeito', async ({
    browser,
    baseURL,
  }) => {
    const title = `Compromisso Fantasma ${uniqueSuffix()}`

    const context = await browser.newContext()
    const pageForm = await context.newPage()
    await login(pageForm, physician.email, physician.password)
    await pageForm.goto('/appointments')
    await pageForm.getByRole('button', { name: 'Novo agendamento' }).click()
    const dialog = pageForm.getByRole('dialog')
    await dialog
      .getByPlaceholder('Buscar paciente por nome')
      .fill('Paciente Adulto Aurora')
    await pageForm
      .getByRole('option', { name: /Paciente Adulto Aurora/ })
      .click()
    await field(dialog, /^Data\b/).fill(todayIso())
    await field(dialog, /^Início\b/).fill('22:00')
    await field(dialog, /^Título\b/).fill(title)

    let persistedCreation = false
    pageForm.on('response', (response) => {
      if (
        response.url().includes(`${API_BASE}/appointments`) &&
        response.request().method() === 'POST' &&
        response.status() < 400
      ) {
        persistedCreation = true
      }
    })

    const pageLogout = await context.newPage()
    await pageLogout.goto('/immunotherapies')
    await pageLogout.getByRole('button', { name: 'Sair' }).click()
    await pageLogout
      .getByRole('button', { name: 'Encerrar sessão' })
      .click()
    await expect(pageLogout).toHaveURL(/\/login/)

    await dialog
      .getByRole('button', { name: 'Agendar compromisso' })
      .click({ timeout: 5_000 })
      .catch(() => null)

    await expect(pageForm).toHaveURL(/\/login/, { timeout: 15_000 })
    expect(persistedCreation).toBe(false)

    const api = await apiLogin(baseURL!, physician.email, physician.password)
    const from = encodeURIComponent(localOffsetIso(todayIso(), '00:00'))
    const to = encodeURIComponent(localOffsetIso(todayIso(), '23:59'))
    const listed = await api.get(
      `${API_BASE}/appointments?from=${from}&to=${to}&pageSize=100`,
    )
    expect(listed.ok()).toBe(true)
    const { items } = (await listed.json()) as {
      items: { title: string | null }[]
    }
    expect(items.find((item) => item.title === title)).toBeUndefined()
    await api.dispose()

    await context.close()
  })
})
