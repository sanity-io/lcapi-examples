import studio from '@sanity/eslint-config-studio'
import reactCompiler from 'eslint-plugin-react-compiler'

export default [
  ...studio,
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
]
