'use client'

import {generateThemeColors} from '@repo/generate-theme-colors'
import {useOptimistic, useTransition} from 'react'

import {randomColorTheme} from './actions'

export function ThemeLayout({
  children,
  background,
  text,
}: {
  children: React.ReactNode
  background: string | null | undefined
  text: string | null | undefined
}) {
  const [theme, setOptimisticTheme] = useOptimistic({background, text})
  const [pending, startTransition] = useTransition()
  function formAction() {
    const nextTheme = generateThemeColors()
    setOptimisticTheme(nextTheme)
    startTransition(() => randomColorTheme(nextTheme.background, nextTheme.text))
  }
  return (
    <html
      lang="en"
      className="bg-theme text-theme transition-colors duration-1000 ease-in-out"
      style={{
        ['--theme-background' as string]: theme.background,
        ['--theme-text' as string]: theme.text,
      }}
    >
      <body>
        <div className="relative flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
          {children}
          <form action={formAction}>
            <button
              disabled={pending}
              type="submit"
              className={`bg-theme-button text-theme-button focus:ring-theme focus:ring-offset-theme focus:outline-hidden cursor-pointer select-none rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2 focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
            >
              {pending ? 'Generating...' : 'Random Color Theme'}
            </button>
          </form>
        </div>
      </body>
    </html>
  )
}
