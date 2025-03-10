import {createServerFn} from '@tanstack/start'
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
          await randomColorTheme()
        })
      }
      className={`bg-theme-button text-theme-button focus:ring-theme focus:ring-offset-theme cursor-pointer select-none rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out [view-transition-name:theme-button] focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2 focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
    >
      {pending ? 'Generating...' : 'Random Color Theme'}
    </button>
  )
}
