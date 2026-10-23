// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  server: {
    port: 7331,
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
