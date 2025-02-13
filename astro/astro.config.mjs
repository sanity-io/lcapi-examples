// @ts-check
import vercel from '@astrojs/vercel'
import {defineConfig} from 'astro/config'
import tailwindcss from "@tailwindcss/vite";


// https://astro.build/config
export default defineConfig({
  adapter: vercel({isr: true, skewProtection: true}),
  vite: {
    plugins: [tailwindcss()],
  },
})
