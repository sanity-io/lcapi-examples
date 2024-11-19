import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'hiomol4a',
    dataset: 'lcapi',
  },
  autoUpdates: true,
})
