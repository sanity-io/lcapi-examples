import { FlatCompat } from '@eslint/eslintrc'
import hooksPlugin from "eslint-plugin-react-hooks";
import reactCompiler from 'eslint-plugin-react-compiler'

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
})
const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    plugins: {
      "react-compiler": reactCompiler,
      "react-hooks": hooksPlugin,
    },
    rules: {
      "react-compiler/react-compiler": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
]
export default eslintConfig