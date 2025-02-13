const preset = require('@sanity/prettier-config')

module.exports = {
  ...preset,
  plugins: [
    ...preset.plugins,
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-astro',
    'prettier-plugin-svelte',
    'prettier-plugin-tailwindcss',
  ],
  overrides: [...preset.overrides, {
    "files": "*.svelte",
    "options": {
      "parser": "svelte"
    }
  }]
}
