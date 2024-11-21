/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        'theme': 'var(--theme-background,#fff)',
        'theme-button': 'var(--theme-text,#fff)',
      },
      textColor: {
        'theme': 'var(--theme-text,#000)',
        'theme-button': 'var(--theme-background,#fff)',
      },
      ringColor: {
        theme: 'var(--theme-text,#000)',
      },
      ringOffsetColor: {
        theme: 'var(--theme-background,#fff)',
      },
    },
  },
}
