import { useEffect, useState } from 'react'

/*
 * 화면이 두 개뿐이라 라우터 라이브러리 없이 주소(/, /map)만 쓴다.
 * 주소에 화면이 남아 있어서, 카메라를 다녀오며 페이지가 다시 열려도 지도 화면이 유지된다.
 * 휴대폰 뒤로가기도 동작한다. (Vercel에서 /map 새로고침이 되도록 vercel.json에 설정)
 */
export type Route = 'home' | 'map'

const read = (): Route => {
  /* 예전 주소(/#/map)로 들어와도 /map으로 바꿔준다 */
  if (window.location.hash === '#/map') window.history.replaceState(null, '', '/map')
  return window.location.pathname === '/map' ? 'map' : 'home'
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read)
  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('popstate', onChange)
    window.addEventListener('hashchange', onChange)
    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('hashchange', onChange)
    }
  }, [])
  return route
}

export function go(route: Route) {
  const path = route === 'map' ? '/map' : '/'
  if (window.location.pathname === path) return
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
