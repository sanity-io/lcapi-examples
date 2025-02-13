// @ts-check
import vercel from '@astrojs/vercel'
import {defineConfig} from 'astro/config'
import tailwindcss from "@tailwindcss/vite";


import react from '@astrojs/react';


// https://astro.build/config
export default defineConfig({
  adapter: vercel({isr: true, skewProtection: true}),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
})