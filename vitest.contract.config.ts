import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/contracts/**/*-http.test.ts'],
    maxWorkers: 1,
    testTimeout: 15000,
  },
})
