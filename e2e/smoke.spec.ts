import { test, expect } from '@playwright/test'

const EMAIL =
  process.env.PLAYWRIGHT_DEMO_EMAIL ?? 'medico.aurora@demo.allervia.local'
const PASSWORD = process.env.PLAYWRIGHT_DEMO_PASSWORD ?? 'Demo!Allervia#2026'

const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? '/backend'

test.describe('entrada, rota privada e saída', () => {
  test('login real leva à rota privada e logout revoga a sessão', async ({
    page,
    context,
    playwright,
    baseURL,
  }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill(EMAIL)
    await page.getByPlaceholder('Insira aqui').fill(PASSWORD)
    const sessionResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`${API_BASE}/auth/session`) &&
        response.ok(),
    )
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/immunotherapies/)
    await sessionResponse

    await page.reload()
    await expect(page).toHaveURL(/\/immunotherapies/)

    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()
    const originalCookies = await context.cookies()
    const sessionCookie = originalCookies.find((cookie) =>
      /allervia_session_v2$/.test(cookie.name),
    )
    expect(sessionCookie).toBeDefined()

    await page.getByRole('button', { name: 'Sair' }).click()
    const logoutResponse = page.waitForResponse((response) =>
      response.url().includes(`${API_BASE}/auth/logout`),
    )
    await page.getByRole('button', { name: 'Encerrar sessão' }).click()
    expect((await logoutResponse).status()).toBe(204)
    await expect(page).toHaveURL(/\/login/)

    const replayClient = await playwright.request.newContext({
      baseURL,
    })
    const revoked = await replayClient.get(`${API_BASE}/auth/session`, {
      headers: { Cookie: `${sessionCookie!.name}=${sessionCookie!.value}` },
    })
    expect(revoked.status()).toBe(401)
    await replayClient.dispose()

    const anotherPage = await context.newPage()
    await anotherPage.goto('/immunotherapies')
    await expect(anotherPage).toHaveURL(/\/login/)
    await anotherPage.close()
  })
})
