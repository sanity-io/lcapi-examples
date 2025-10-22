import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import {defineConfig} from 'eslint/config'

export default defineConfig([
  {
    extends: [...nextCoreWebVitals, ...nextTypescript],
    rules: {
      'react-hooks/exhaustive-deps': 'error',
    },
  },
])
