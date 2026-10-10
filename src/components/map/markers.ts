import L from 'leaflet'
import type { Place } from '../../lib/places.ts'
import { bestBin } from '../../lib/recommend.ts'

/* 마커는 HTML로 그린다. 색 규칙: 일반 포함 = 세이지, 재활용만 = 버터, 확인 안 됨 = 잉크 소프트 */
const BIN_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 7.5h13"/><path d="M10 4.5h4"/><path d="M7 7.5l.9 11.2a1.8 1.8 0 0 0 1.8 1.6h4.6a1.8 1.8 0 0 0 1.8-1.6L17 7.5"/></svg>'

function placeColor(place: Place): string {
  const bin = bestBin(place)?.bin ?? place.bins[0]
  if (bin.pet_waste_status === 'allowed' || bin.waste_kind === 'general' || bin.waste_kind === 'general_and_recycle')
    return 'bg-sage text-paper'
  if (bin.waste_kind === 'recycle') return 'bg-butter text-ink'
  return 'bg-ink-soft text-paper'
}

export function placeIcon(place: Place, selected: boolean): L.DivIcon {
  const size = selected ? 46 : 38
  const ring = selected ? 'ring-4 ring-butter/70' : ''
  const count =
    place.bins.length > 1
      ? `<span class="absolute -top-1.5 -right-1.5 flex size-[22px] items-center justify-center rounded-pill border-2 border-paper bg-orange text-[12px] font-bold text-paper">${place.bins.length}</span>`
      : ''
  return L.divIcon({
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    html: `
      <div class="relative flex flex-col items-center" style="width:${size}px">
        <div class="relative flex items-center justify-center rounded-pill border-[2.5px] border-paper shadow-soft ${placeColor(place)} ${ring}" style="width:${size}px;height:${size}px">${BIN_SVG}${count}</div>
        <div class="-mt-[3px] h-0 w-0 border-x-[6px] border-t-[9px] border-x-transparent border-t-paper"></div>
      </div>`,
  })
}

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
