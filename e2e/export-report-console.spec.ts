import { test, expect } from '@playwright/test'
import { credential, login } from './support'

const physician = credential('medico.aurora@demo.allervia.local')

test('a página de exportação monta sem erros de atualização em loop', async ({
  page,
}) => {
  const updateDepthErrors: string[] = []
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      message.text().includes('Maximum update depth')
    ) {
      updateDepthErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    if (error.message.includes('Maximum update depth')) {
      updateDepthErrors.push(error.message)
    }
  })

  await login(page, physician.email, physician.password)
  await page.goto('/export-report')
  await expect(
    page.getByRole('heading', { name: /exportação|relatório/i }).first(),
  ).toBeVisible()

  await page.getByRole('button', { name: /período/i }).first().click()
  await expect(
    page.getByRole('dialog', { name: 'Selecionar período' }),
  ).toBeVisible()
  await page.waitForTimeout(500)

  expect(updateDepthErrors).toEqual([])
})
