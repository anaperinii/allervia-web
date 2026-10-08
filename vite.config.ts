import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

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
