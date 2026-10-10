import { useEffect, useState } from 'react'

/* 화면이 두 개뿐이라 라우터 대신 주소의 #만 쓴다. 휴대폰 뒤로가기도 동작한다 */
export type Route = 'home' | 'map'

const read = (): Route => (window.location.hash === '#/map' ? 'map' : 'home')

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function go(route: Route) {
  window.location.hash = route === 'map' ? '#/map' : ''
}
