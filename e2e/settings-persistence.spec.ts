import { test, expect, type Page } from '@playwright/test'
import { API_BASE, credential, login } from './support'

const physician = credential('medico.boreal@demo.allervia.local')

interface AutomationSettings {
  enabled: boolean
  timeZone: string
  revision?: number
}

async function readAutomationFromServer(page: Page): Promise<AutomationSettings> {
  const response = await page.request.get(
    `${API_BASE}/treatment-protocols/automation`,
  )
  expect(response.ok()).toBe(true)
  return (await response.json()) as AutomationSettings
}

async function setAutomationViaApi(
  page: Page,
  baseURL: string,
  enabled: boolean,
): Promise<void> {
  const current = await readAutomationFromServer(page)
  if (current.enabled === enabled) return
  const csrfResponse = await page.request.get(
    `${API_BASE}/auth/csrf?scope=session`,
  )
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string }
  const patched = await page.request.patch(
    `${API_BASE}/treatment-protocols/automation`,
    {
      headers: { 'X-CSRF-Token': csrfToken, Origin: baseURL },
      data: {
        enabled,
        timeZone: current.timeZone,
        ...(current.revision !== undefined
          ? { expectedRevision: current.revision }
          : {}),
      },
    },
  )
  expect(patched.ok()).toBe(true)
}

test('alternar a automação em /protocols persiste no servidor e sobrevive ao reload', async ({
  page,
  baseURL,
}) => {
  await login(page, physician.email, physician.password)
  await page.goto('/protocols')

  const toggle = page.getByRole('switch', { name: 'Recomendação automática' })
  await expect(toggle).toBeVisible()
  await expect(toggle).toBeEnabled()
  const initialState = await readAutomationFromServer(page)

  try {
    const saved = page.waitForResponse(
      (response) =>
        response.url().includes(`${API_BASE}/treatment-protocols/automation`) &&
        response.request().method() === 'PATCH',
    )
    await toggle.click()
    expect((await saved).ok()).toBe(true)

    await page.reload()
    const toggled = page.getByRole('switch', {
      name: 'Recomendação automática',
    })
    await expect(toggled).toBeVisible()
    await expect(toggled).toHaveAttribute(
      'aria-checked',
      String(!initialState.enabled),
    )

    const persisted = await readAutomationFromServer(page)
    expect(persisted.enabled).toBe(!initialState.enabled)

    const restored = page.waitForResponse(
      (response) =>
        response.url().includes(`${API_BASE}/treatment-protocols/automation`) &&
        response.request().method() === 'PATCH',
    )
    await toggled.click()
    expect((await restored).ok()).toBe(true)

    await page.reload()
    await expect(
      page.getByRole('switch', { name: 'Recomendação automática' }),
    ).toHaveAttribute('aria-checked', String(initialState.enabled))

    const final = await readAutomationFromServer(page)
    expect(final.enabled).toBe(initialState.enabled)
  } finally {
    await setAutomationViaApi(page, baseURL!, initialState.enabled)
  }
})
