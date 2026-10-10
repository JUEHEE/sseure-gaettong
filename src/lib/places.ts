import type { PlacedBin } from '../types/bin.ts'

/*
 * 장소 = 같은 좌표에 있는 쓰레기통 묶음.
 * 정확한 위치를 모를 때 여러 통이 한 좌표(예: 단지 주소)에 겹치므로, 지도에는 마커 하나로 보여준다.
 */
export type Place = {
  key: string
  lat: number
  lng: number
  name: string
  bins: PlacedBin[]
}

export function groupPlaces(bins: PlacedBin[]): Place[] {
  const map = new Map<string, PlacedBin[]>()
  for (const bin of bins) {
    const key = `${bin.latitude.toFixed(6)},${bin.longitude.toFixed(6)}`
    map.set(key, [...(map.get(key) ?? []), bin])
  }
  return [...map.entries()].map(([key, group]) => ({
    key,
    lat: group[0].latitude,
    lng: group[0].longitude,
    name: placeName(group),
    bins: group,
  }))
}

/* "현대홈타운스위트 단지 안 · 벤치 옆" 처럼 ' · ' 앞이 같으면 그 부분을 장소 이름으로 쓴다 */
function placeName(group: PlacedBin[]): string {
  if (group.length === 1) return group[0].detail_location
  const heads = group.map((b) => b.detail_location.split(' · ')[0])
  return heads.every((h) => h === heads[0]) ? heads[0] : group[0].detail_location
}

/* 묶음 안에서 각 통을 구분하는 짧은 설명 ("벤치 옆") */
export function spotName(bin: PlacedBin): string {
  const parts = bin.detail_location.split(' · ')
  return parts.length > 1 ? parts.slice(1).join(' · ') : bin.detail_location
}
