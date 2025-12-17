import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'hiomol4a', dataset: 'lcapi'},
  typegen: {
    path: './api/**/*.{ts,tsx,js,jsx}',
    schema: '../studio/schema.json',
  },
})
