/*
 * 서비스 지역 (생활권)
 * 중심: 푸른수목원 (OpenStreetMap 기준 좌표)
 * 반경: 푸른수목원 기준 도보 약 20분 → 직선 1.5km
 */
export const HANGDONG = {
  code: 'hangdong',
  name: '항동 생활권',
  center: { lat: 37.4841, lng: 126.8245 },
  radiusM: 1500,
} as const
