import { test, expect, type Download } from '@playwright/test'
import { API_BASE, credential, login, revokeOwnSessionViaApi } from './support'

const physician = credential('medico.aurora@demo.allervia.local')
const EXPORT_PATTERN = /\/immunotherapies\/export/

test('sessão revogada no meio da exportação paginada: página 2 recebe 401 e nada é baixado', async ({
  page,
  baseURL,
}) => {
  await login(page, physician.email, physician.password)
  await page.goto('/export-report')

  const formatLabel = page.locator('label').filter({ hasText: /^Formato\b/ })
  const formatSelect = formatLabel.locator('xpath=..').locator('select')
  await formatSelect.selectOption('csv')
  await page
    .getByPlaceholder('Motivo desta exportação (LGPD)')
    .fill('Exportação e2e interrompida por revogação de sessão.')
  await page.getByRole('checkbox').check()

  const downloads: Download[] = []
  page.on('download', (download) => downloads.push(download))

  await page.route(EXPORT_PATTERN, async (route) => {
    const url = new URL(route.request().url())
    const requestedPage = url.searchParams.get('page')
    if (requestedPage === '1') {
      const serverResponse = await route.fetch()
      expect(serverResponse.status(), 'A primeira página deve ser válida antes de simular a interrupção').toBe(200)
      const body = (await serverResponse.json()) as { items: unknown[] }
      await route.fulfill({
        response: serverResponse,
        json: { ...body, total: body.items.length + 150 },
      })
      return
    }
    await revokeOwnSessionViaApi(page, baseURL!)
    await route.continue()
  })

  const secondPage = page.waitForResponse(
    (response) =>
      EXPORT_PATTERN.test(response.url()) &&
      new URL(response.url()).searchParams.get('page') === '2',
  )
  await page.getByRole('button', { name: 'Exportar CSV' }).click()
  await page.getByRole('button', { name: 'Confirmar e exportar' }).click()

  expect((await secondPage).status()).toBe(401)

  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
  expect(downloads).toHaveLength(0)

  const sessionAfter = await page.request.get(`${API_BASE}/auth/session`)
  expect(sessionAfter.status()).toBe(401)
})
