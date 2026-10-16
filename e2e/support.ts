import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, request as playwrightRequest, type APIRequestContext, type Locator, type Page } from '@playwright/test'
import { generateSync } from 'otplib'

export const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? '/backend'
export const PASSWORD_FALLBACK = 'Demo!Allervia#2026'

export interface DemoCredential {
  organization: string
  email: string
  role: string
  password: string
  totpSecret?: string
}

const credentialsPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  process.env.PLAYWRIGHT_CREDENTIALS_FILE ?? '../../allervia-backend/scripts/.demo-credentials.local.json',
)

export function credential(email: string): DemoCredential {
  const parsed = JSON.parse(readFileSync(credentialsPath, 'utf8')) as {
    credentials: DemoCredential[]
  }
  const found = parsed.credentials.find((item) => item.email === email)
  if (!found) throw new Error(`Credencial não encontrada para ${email}`)
  return found
}

export function totpCode(secret: string): string {
  return generateSync({ secret, period: 30 })
}

export function msUntilNextTotpWindow(): number {
  const periodMs = 30_000
  return periodMs - (Date.now() % periodMs)
}

export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByPlaceholder('Insira aqui').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/immunotherapies/, { timeout: 15_000 })
  await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()
}

export function field(root: Page | Locator, label: RegExp): Locator {
  return root
    .locator('label')
    .filter({ hasText: label })
    .first()
    .locator('xpath=..')
    .locator('select, input, textarea')
    .first()
}

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function letterSuffix(): string {
  const source = `${Date.now()}${Math.floor(Math.random() * 100)}`
  return source
    .split('')
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join('')
}

export function generateCpf(): string {
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  const checkDigit = (slice: number[]): number => {
    const sum = slice.reduce(
      (acc, digit, index) => acc + digit * (slice.length + 1 - index),
      0,
    )
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  const first = checkDigit(digits)
  const second = checkDigit([...digits, first])
  return [...digits, first, second].join('')
}

export function localOffsetIso(dateIso: string, time: string): string {
  const offsetMinutes = -new Date().getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absolute = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0')
  const minutes = String(absolute % 60).padStart(2, '0')
  return `${dateIso}T${time}:00${sign}${hours}:${minutes}`
}

export function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function pastTimeToday(
  preferredTyped?: string,
  minMinutes = 1,
): { typed: string; expected: string } {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  if (preferredTyped) {
    const preferredMinutes =
      Number(preferredTyped.slice(0, 2)) * 60 + Number(preferredTyped.slice(2))
    if (nowMinutes > preferredMinutes + 5 && preferredMinutes >= minMinutes) {
      return {
        typed: preferredTyped,
        expected: `${preferredTyped.slice(0, 2)}:${preferredTyped.slice(2)}`,
      }
    }
  }
  let total = Math.max(nowMinutes - 10, minMinutes)
  if (total > nowMinutes) total = nowMinutes
  const hours = String(Math.floor(total / 60)).padStart(2, '0')
  const minutes = String(total % 60).padStart(2, '0')
  return { typed: `${hours}${minutes}`, expected: `${hours}:${minutes}` }
}

export function timeToMinutes(expected: string): number {
  return Number(expected.slice(0, 2)) * 60 + Number(expected.slice(3))
}

export async function fillTimeSelect(page: Page, name: string, typed: string, expected: string): Promise<void> {
  const input = page.getByRole('textbox', { name })
  await input.fill('')
  await input.pressSequentially(typed)
  await page.keyboard.press('Tab')
  await expect(input).toHaveValue(expected)
}

export function minutesToTime(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minutes = String(totalMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

export async function fillAdministrationWindow(
  page: Page,
  start: { typed: string; expected: string },
): Promise<void> {
  await fillTimeSelect(page, 'Hora início', start.typed, start.expected)
  const end = minutesToTime(timeToMinutes(start.expected) + 5)
  await fillTimeSelect(page, 'Hora fim', end.replace(':', ''), end)
}

export async function apiLogin(
  baseURL: string,
  email: string,
  password: string,
): Promise<APIRequestContext> {
  const api = await playwrightRequest.newContext({ baseURL })
  const csrfResponse = await api.get(`${API_BASE}/auth/csrf`)
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string }
  const session = await api.post(`${API_BASE}/auth/sessions`, {
    headers: { 'X-CSRF-Token': csrfToken, Origin: baseURL },
    data: { email, password },
  })
  expect(session.ok()).toBe(true)
  return api
}

export async function revokeOwnSessionViaApi(page: Page, baseURL: string): Promise<void> {
  const csrfResponse = await page.request.get(`${API_BASE}/auth/csrf?scope=session`)
  const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string }
  const logout = await page.request.post(`${API_BASE}/auth/logout`, {
    headers: {
      'X-CSRF-Token': csrfToken,
      Origin: baseURL,
      'Content-Type': 'application/json',
    },
    data: {},
  })
  expect(logout.status()).toBe(204)
}
