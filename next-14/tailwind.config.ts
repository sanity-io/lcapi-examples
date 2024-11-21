import type {Config} from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
  plugins: [],
} satisfies Config
