import react from '@astrojs/react'
import vercel from '@astrojs/vercel'
import {cacheVercel} from '@astrojs/vercel/cache'
import tailwindcss from '@tailwindcss/vite'
import {defineConfig, envField} from 'astro/config'

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  cache: {provider: cacheVercel()},
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      // True where `studio/functions/cache-invalidate` purges this deployment. Production is assumed to.
      SANITY_SYNC_TAG_FUNCTION: envField.boolean({
        context: 'server',
        access: 'public',
        default: false,
      }),
      VERCEL_ENV: envField.enum({
        context: 'server',
        access: 'public',
        values: ['production', 'preview', 'development'],
        optional: true,
      }),
    },
  },
})
