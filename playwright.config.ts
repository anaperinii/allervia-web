import { defineConfig, devices } from '@playwright/test'

const WEB_PORT = Number(process.env.PLAYWRIGHT_WEB_PORT ?? 5175)
const API_PORT = Number(process.env.PLAYWRIGHT_API_PORT ?? 3105)
const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${WEB_PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_EXTERNAL_SERVER === 'true' ? undefined : [
    {
      command: 'npm run start:demo',
      cwd: '../allervia-backend',
      port: API_PORT,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: String(API_PORT),
      },
    },
    {
      command: `npm run dev -- --port ${WEB_PORT} --strictPort`,
      port: WEB_PORT,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        VITE_API_PROXY_TARGET: `http://localhost:${API_PORT}`,
      },
    },
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
