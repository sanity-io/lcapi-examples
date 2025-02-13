import {headers} from 'next/headers'

export async function UserAgent() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')

  return (
    <div className="bg-theme-button text-theme-button absolute bottom-2 left-2 block rounded-sm text-xs transition duration-1000 ease-in-out">
      <span className="inline-block py-1 pl-2 pr-0.5">User Agent:</span>
      <span className="bg-theme text-theme mr-0.5 inline-block rounded-r-sm px-1 py-0.5 tabular-nums transition duration-1000 ease-in-out">
        {userAgent}
      </span>
    </div>
  )
}
