import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

/**
 * A API é servida no mesmo domínio da UI: em produção pelo gateway, em
 * desenvolvimento por este proxy. Mesma origem é o que permite o cookie
 * `__Host-` e dispensa CORS. O prefixo `/backend` é removido antes de chegar ao
 * NestJS — não confundir com `/api`, que hoje serve a documentação Swagger.
 */
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    TanStackRouterVite(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/backend': {
        target: API_TARGET,
        changeOrigin: false,
        rewrite: (requestPath) => requestPath.replace(/^\/backend/, ''),
      },
    },
  },
})
