import { useEffect, useState } from 'react'
import type { LatLng } from '../types/bin.ts'

export type LocationState =
  | { status: 'loading' }
  | { status: 'ok'; position: LatLng; accuracyM: number }
  | { status: 'denied' }
  | { status: 'unavailable' }

/*
 * 휴대폰 위치를 계속 따라간다.
 * 브라우저 위치 기능은 https 주소나 localhost에서만 동작한다.
 */
export function useMyLocation(): LocationState {
  const [state, setState] = useState<LocationState>(() =>
    'geolocation' in navigator ? { status: 'loading' } : { status: 'unavailable' },
  )

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          status: 'ok',
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracyM: pos.coords.accuracy,
        }),
      (err) =>
        setState({ status: err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable' }),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return state
}
