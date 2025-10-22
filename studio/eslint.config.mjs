import studio from '@sanity/eslint-config-studio'
import reactHooks from 'eslint-plugin-react-hooks'

export default [...studio, reactHooks.configs.flat.recommended]
