import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'hiomol4a', dataset: 'lcapi'},
  typegen: {
    path: './src/**/*.{ts,tsx,js,jsx,mjs,cjs,astro}',
    schema: '../studio/schema.json',
  },
})
