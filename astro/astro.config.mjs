// @ts-check
import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),

  vite: {
    plugins: [
      // @ts-expect-error - tailwindcss typings are wonky for some reason
      tailwindcss(),
    ],
  },

  integrations: [react()],
})
