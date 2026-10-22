import { useEffect, useState } from 'react'

export type Route = { path: string; query: URLSearchParams }

const read = (): Route => {
  const raw = window.location.hash.replace(/^#/, '') || '/s02'
  const [path, search = ''] = raw.split('?')
  return { path: path || '/s02', query: new URLSearchParams(search) }
}

export const navigate = (to: string) => {
  window.location.hash = to
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
