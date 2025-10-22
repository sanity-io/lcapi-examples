//  @ts-check

import {tanstackConfig} from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'

export default [...tanstackConfig, reactHooks.configs.flat.recommended]
