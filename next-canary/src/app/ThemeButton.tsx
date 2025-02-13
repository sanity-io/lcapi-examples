'use client'

import {useTransition} from 'react'
import {randomColorTheme} from './actions'

export function ThemeButton() {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(() =>
          randomColorTheme().then((data) => {
            if (data?.background && data?.text) {
              document.documentElement.style.setProperty('--theme-background', data.background)
              document.documentElement.style.setProperty('--theme-text', data.text)
            }
          }),
        )
      }
      className={`bg-(--theme-text) text-(--theme-background) focus:ring-(--theme-text) focus:ring-offset-(--theme-background) focus:outline-hidden cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2 focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
    >
      {pending ? 'Generating...' : 'Random Color Theme'}
    </button>
  )
}
