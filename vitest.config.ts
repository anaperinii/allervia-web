import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    exclude: ['test/contracts/**'],
    setupFiles: ['./test/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    maxWorkers: 1,
    // Interações de userEvent sobre árvores grandes estouram os 5s padrão em
    // máquinas carregadas; o limite maior elimina flakes sem mascarar erros.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
