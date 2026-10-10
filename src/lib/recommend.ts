import type { LatLng, PlacedBin } from '../types/bin.ts'
import { distanceM } from './geo.ts'

/*
 * 추천 순위 (docs/product.md 7절)
 * 실제 거리 × 가중치 = 체감 거리. 체감 거리가 짧은 순으로 추천한다.
 * 가중치는 "버릴 수 있을 가능성"을 반영할 뿐, 배변봉투 허용을 뜻하지 않는다.
 */
function weight(bin: PlacedBin): number | null {
  if (bin.status !== 'active' || bin.pet_waste_status === 'not_allowed') return null
  if (bin.pet_waste_status === 'allowed') return 1.0
  if (bin.bin_type === 'pet_bag_box') return 1.2
  if (bin.waste_kind === 'general' || bin.waste_kind === 'general_and_recycle') return 1.3
  if (bin.waste_kind === 'recycle') return 1.8
  return 1.5 // waste_kind 확인 안 됨
}

export type Candidate = { bin: PlacedBin; distanceM: number }

export function recommend(me: LatLng, bins: PlacedBin[], count = 3): Candidate[] {
  return bins
    .flatMap((bin) => {
      const w = weight(bin)
      if (w === null) return []
      const d = distanceM(me, { lat: bin.latitude, lng: bin.longitude })
      return [{ bin, distanceM: d, score: d * w }]
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(({ bin, distanceM }) => ({ bin, distanceM }))
}

/* 외부 지도 앱 길찾기 (앱 안에서 길찾기는 만들지 않는다) */
export function kakaoDirectionsUrl(bin: PlacedBin): string {
  const name = encodeURIComponent(bin.detail_location.replace(/,/g, ' '))
  return `https://map.kakao.com/link/to/${name},${bin.latitude},${bin.longitude}`
}
