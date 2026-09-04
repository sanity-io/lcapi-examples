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
         * True where the studio's `cache-invalidate` Sanity Function calls this
         * deployment's `/api/revalidate-tags`: Vercel production, or anywhere
         * `SANITY_SYNC_TAG_INVALIDATE_FUNCTION` is set. It drives one strategy: SSR
         * responses are CDN-cached with sync tags and purged by the function, and live
         * events wait for that purge (`waitFor: 'function'`). Local dev and previews
         * are not called, so they are not CDN-cached and get live events at once.
         * Runtime override: `NUXT_PUBLIC_SANITY_INVALIDATED_BY_FUNCTION`.
         */
        invalidatedByFunction:
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
    // @nuxt/schema imports `vite` types without declaring the dependency, so in this
    // workspace (sveltekit and tanstack-start pin vite 7) it can resolve to whichever
    // copy pnpm hoisted. Pin it to the vite this package installs. The path names the
    // declaration file because `paths` does not read vite's `exports` map.
    nodeTsConfig: {
      compilerOptions: {paths: {vite: ['../node_modules/vite/dist/node/index.d.ts']}},
    },
  },
})
