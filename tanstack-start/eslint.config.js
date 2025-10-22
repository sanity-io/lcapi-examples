//  @ts-check

import {tanstackConfig} from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  ...tanstackConfig,
  reactHooks.configs.flat.recommended,
  {
    name: 'please stop it',
    files: ['**/*.{js,ts,tsx}'],
    rules: {
      'import/consistent-type-specifier-style': 'off',
      'import/first': 'off',
      'import/newline-after-import': 'off',
      'import/no-commonjs': 'off',
      'import/no-duplicates': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/array-type': 'off',
    },
  },
]
