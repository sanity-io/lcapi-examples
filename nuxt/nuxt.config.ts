import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {enabled: true},
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@vueuse/motion/nuxt'],
  runtimeConfig: {
    public: {
      sanity: {
        /**
         * Live events wait for the studio's `cache-invalidate` Sanity Function
         * (`waitFor: 'function'`) only where that function calls this deployment's
         * `/api/revalidate-tags`: Vercel production, or anywhere
         * `SANITY_SYNC_TAG_INVALIDATE_FUNCTION` is set. Local dev and previews are not
         * called, so waiting would only delay updates. Runtime override:
         * `NUXT_PUBLIC_SANITY_WAIT_FOR_FUNCTION`.
         */
        waitForFunction:
          Boolean(process.env.SANITY_SYNC_TAG_INVALIDATE_FUNCTION) ||
          process.env.VERCEL_ENV === 'production',
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    typeCheck: true,
  },
})
