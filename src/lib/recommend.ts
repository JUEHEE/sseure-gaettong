import type { LatLng, PlacedBin } from '../types/bin.ts'
import type { Place } from './places.ts'
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

/* 장소의 가중치 = 그 장소에서 가장 버리기 좋은 통의 가중치 */
export function bestBin(place: Place): { bin: PlacedBin; weight: number } | null {
  let best: { bin: PlacedBin; weight: number } | null = null
  for (const bin of place.bins) {
    const w = weight(bin)
    if (w !== null && (!best || w < best.weight)) best = { bin, weight: w }
  }
  return best
}

export type Candidate = { place: Place; distanceM: number }

export function recommend(me: LatLng, places: Place[], count = 3): Candidate[] {
  return places
    .flatMap((place) => {
      const best = bestBin(place)
      if (!best) return []
      const d = distanceM(me, place)
      return [{ place, distanceM: d, score: d * best.weight }]
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(({ place, distanceM }) => ({ place, distanceM }))
}

/* 외부 지도 앱 길찾기 (앱 안에서 길찾기는 만들지 않는다) */
export function kakaoDirectionsUrl(place: Place): string {
  const name = encodeURIComponent(place.name.replace(/,/g, ' '))
  return `https://map.kakao.com/link/to/${name},${place.lat},${place.lng}`
}
