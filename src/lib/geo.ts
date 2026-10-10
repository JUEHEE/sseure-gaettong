import type { LatLng } from '../types/bin.ts'

const EARTH_RADIUS_M = 6371000
const toRad = (deg: number) => (deg * Math.PI) / 180

/* 두 지점 사이 직선거리 (m) */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

/* a에서 b를 바라본 방향 → "북동쪽" 같은 8방위 */
export function directionLabel(a: LatLng, b: LatLng): string {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat))
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng))
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  const names = ['북쪽', '북동쪽', '동쪽', '남동쪽', '남쪽', '남서쪽', '서쪽', '북서쪽']
  return names[Math.round(((bearing + 360) % 360) / 45) % 8]
}

/* 걷는 속도 분당 약 67m (시속 4km). 직선거리라 실제보다 조금 짧게 나올 수 있다 */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.ceil(meters / 67))
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters / 10) * 10}m` : `${(meters / 1000).toFixed(1)}km`
}
