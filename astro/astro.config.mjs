// @ts-check
import vercel from '@astrojs/vercel'
import {defineConfig} from 'astro/config'
import tailwindcss from "@tailwindcss/vite";


// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
})
