import L from 'leaflet'
import type { Place } from '../../lib/places.ts'
import { bestBin } from '../../lib/recommend.ts'
import { binStickerSvg } from '../icons/Stickers.tsx'

/*
 * 마커 = 크림 원 + 초코 외곽선 + 쓰레기통 스티커 (마스코트와 같은 화풍)
 * 색: 일반 = 세이지, 재활용만 = 버터, 확인 안 됨 = 베이지
 */
export function placeIcon(place: Place, selected: boolean): L.DivIcon {
  const bin = bestBin(place)?.bin ?? place.bins[0]
  const size = selected ? 50 : 40
  const sticker = Math.round(size * 0.66)
  const halo = selected ? 'box-shadow:0 0 0 5px rgb(242 207 114 / 0.7), 0 6px 14px -6px rgb(63 52 41 / 0.45);' : 'box-shadow:0 4px 10px -5px rgb(63 52 41 / 0.45);'
  const count =
    place.bins.length > 1
      ? `<span class="absolute -top-1 -right-1 flex size-[20px] items-center justify-center rounded-pill border-2 border-ink bg-orange text-[11px] font-bold text-paper">${place.bins.length}</span>`
      : ''
  return L.divIcon({
    className: '',
    iconSize: [size, size + 9],
    iconAnchor: [size / 2, size + 9],
    html: `
      <div class="relative flex flex-col items-center" style="width:${size}px">
        <div class="relative flex items-center justify-center rounded-pill border-2 border-ink bg-paper" style="width:${size}px;height:${size}px;${halo}">${binStickerSvg(bin.waste_kind, sticker)}${count}</div>
        <svg width="14" height="10" viewBox="0 0 14 10" class="-mt-[2px]" aria-hidden="true"><path d="M1 1 L7 8.5 L13 1" fill="#FFFDF8" stroke="#3F3429" stroke-width="2" stroke-linejoin="round"/></svg>
      </div>`,
  })
}

/* 내 위치: 오렌지 점 + 퍼지는 고리 */
export const meIcon = L.divIcon({
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: `
    <div class="relative flex size-7 items-center justify-center">
      <span class="absolute inset-0 animate-ping rounded-pill bg-orange/40"></span>
      <span class="relative size-[18px] rounded-pill border-[3px] border-paper bg-orange shadow-soft"></span>
    </div>`,
})
