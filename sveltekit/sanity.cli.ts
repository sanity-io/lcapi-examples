import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {projectId: 'hiomol4a', dataset: 'lcapi'},
  typegen: {
    path: './src/**/*.ts',
    schema: '../studio/schema.json',
    generates: './src/sanity.types.ts',
  },
})
