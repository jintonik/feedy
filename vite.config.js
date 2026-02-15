import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // Для GitHub Pages
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
