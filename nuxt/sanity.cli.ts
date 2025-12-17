import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'hiomol4a', dataset: 'lcapi'},
  typegen: {
    path: './app/utils/sanity/**/*.ts',
    schema: '../studio/schema.json',
    generates: './app/utils/sanity/types.ts',
  },
})
