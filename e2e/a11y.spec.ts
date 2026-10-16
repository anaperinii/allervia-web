import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page, type TestInfo } from '@playwright/test'
import { credential, login } from './support'

const physician = credential('medico.aurora@demo.allervia.local')

async function auditPage(page: Page, testInfo: TestInfo, pageName: string) {
  const results = await new AxeBuilder({ page }).analyze()
  const critical = results.violations.filter(
    (violation) => violation.impact === 'critical',
  )
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious',
  )
  const summary = {
    page: pageName,
    critical: critical.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.length,
      help: violation.help,
    })),
    serious: serious.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.length,
      help: violation.help,
    })),
  }
  await testInfo.attach(`axe-${pageName}`, {
    body: JSON.stringify(summary, null, 2),
    contentType: 'application/json',
  })
  console.log(
    `[axe] ${pageName}: critical=${critical.length} serious=${serious.length}` +
      (serious.length > 0
        ? ` (serious: ${serious.map((violation) => violation.id).join(', ')})`
        : ''),
  )
  expect(
    critical.map((violation) => `${violation.id} (${violation.nodes.length})`),
  ).toEqual([])
}

test.describe('acessibilidade', () => {
  test('axe: página de login sem violações críticas', async ({ page }, testInfo) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    await auditPage(page, testInfo, 'login')
  })

  test('axe: painel de métricas autenticado sem violações críticas', async ({
    page,
  }, testInfo) => {
    await login(page, physician.email, physician.password)
    await page.goto('/dashboard')
    await expect(page.getByText(/adesão|aplicações|sem aplicações/i).first()).toBeVisible({
      timeout: 15_000,
    })
    await auditPage(page, testInfo, 'dashboard')
  })

  test('axe: lista de imunoterapias (pacientes) sem violações críticas', async ({
    page,
  }, testInfo) => {
    await login(page, physician.email, physician.password)
    await expect(
      page.getByRole('button', { name: 'Evoluir Paciente' }),
    ).toBeVisible()
    await expect(page.getByText('Carregando tratamentos…')).toBeHidden({
      timeout: 15_000,
    })
    await auditPage(page, testInfo, 'immunotherapies')
  })

  test('login completo apenas com teclado', async ({ page }) => {
    await page.goto('/login')
    const email = page.getByLabel('Email')
    for (let attempt = 0; attempt < 12; attempt++) {
      if (await email.evaluate((el) => el === document.activeElement)) break
      await page.keyboard.press('Tab')
    }
    await expect(email).toBeFocused()
    await page.keyboard.type(physician.email)
    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('Insira aqui')).toBeFocused()
    await page.keyboard.type(physician.password)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/immunotherapies/, { timeout: 15_000 })
  })

  test('modal de logout: foco entra, Escape fecha e o foco volta ao botão Sair', async ({
    page,
  }) => {
    await login(page, physician.email, physician.password)
    const logoutButton = page.getByRole('button', { name: 'Sair' })
    await logoutButton.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('heading', { name: 'Encerrar sessão' }),
    ).toBeVisible()
    const focusInsideDialog = await dialog.evaluate(
      (el) => el.contains(document.activeElement),
    )
    expect(focusInsideDialog).toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(logoutButton).toBeFocused()
  })
})
