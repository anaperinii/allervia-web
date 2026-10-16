import { test, expect, type Page } from '@playwright/test'
import { credential, msUntilNextTotpWindow, totpCode } from './support'

test.describe.configure({ mode: 'serial' })

const admin = credential('admin.aurora@demo.allervia.local')

async function startMfaChallenge(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(admin.email)
  await page.getByPlaceholder('Insira aqui').fill(admin.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(
    page.getByRole('heading', { name: /verificação em duas etapas/i }),
  ).toBeVisible({ timeout: 15_000 })
}

test.describe('login com segundo fator obrigatório', () => {
  test('código TOTP errado mostra o erro do servidor e preserva o formulário do desafio', async ({
    page,
  }) => {
    await startMfaChallenge(page)

    const validNow = totpCode(admin.totpSecret!)
    const wrongCode = validNow === '123456' ? '654321' : '123456'
    const codeInput = page.getByPlaceholder('000000')
    await codeInput.fill(wrongCode)
    await page.getByRole('button', { name: 'Verificar' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /verificação em duas etapas/i }),
    ).toBeVisible()
    await expect(codeInput).toHaveValue(wrongCode)
    await expect(page).toHaveURL(/\/login/)
  })

  test('código TOTP correto conclui o desafio e abre o painel autenticado', async ({
    page,
  }) => {
    await startMfaChallenge(page)

    if (msUntilNextTotpWindow() < 3_000) {
      await page.waitForTimeout(msUntilNextTotpWindow() + 500)
    }
    const codeInput = page.getByPlaceholder('000000')
    await codeInput.fill(totpCode(admin.totpSecret!))
    await page.getByRole('button', { name: 'Verificar' }).click()

    const failedFirstAttempt = await Promise.race([
      page
        .waitForURL(/\/immunotherapies/, { timeout: 15_000 })
        .then(() => false),
      page
        .getByRole('alert')
        .waitFor({ state: 'visible', timeout: 15_000 })
        .then(() => true)
        .catch(() => false),
    ])
    if (failedFirstAttempt) {
      await page.waitForTimeout(msUntilNextTotpWindow() + 500)
      await codeInput.fill(totpCode(admin.totpSecret!))
      await page.getByRole('button', { name: 'Verificar' }).click()
    }

    await expect(page).toHaveURL(/\/immunotherapies/, { timeout: 15_000 })
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()

    await page.reload()
    await expect(page).toHaveURL(/\/immunotherapies/)
  })
})
