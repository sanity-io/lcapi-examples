import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  title: 'Live Content API',

  projectId: 'hiomol4a',
  dataset: 'lcapi',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
