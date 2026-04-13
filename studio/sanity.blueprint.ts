import {defineBlueprint, defineSyncTagInvalidateFunction} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineSyncTagInvalidateFunction({name: 'cache-invalidate'}),
  ],
})