import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/prop-name-casing': 'off',
    'import/first': 'off',
  },
})
