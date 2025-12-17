import {createServerFn} from '@tanstack/react-start'
import {useTransition} from 'react'

const randomColorTheme = createServerFn().handler(async () => {
  const res = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })

  return res.json()
})

export function ThemeButton() {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const data = await randomColorTheme()
          document.documentElement.style.setProperty('--theme-background', data.background)
          document.documentElement.style.setProperty('--theme-text', data.text)
        })
      }
      className={`bg-theme-button text-theme-button focus:ring-theme focus:ring-offset-theme focus:ring-opacity-50 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out select-none [view-transition-name:theme-button] focus:ring-2 focus:ring-offset-2 focus:duration-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
    >
      {pending ? 'Generating...' : 'Random Color Theme'}
    </button>
  )
}
