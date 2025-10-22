import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: {enabled: true},
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@vueuse/motion/nuxt'],
  vite: {
    plugins: [
      // @ts-expect-error - tailwindcss typings are wonky for some reason
      tailwindcss(),
    ],
  },
  typescript: {
    typeCheck: true,
  },
})
