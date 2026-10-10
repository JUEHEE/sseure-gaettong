import L from 'leaflet'
import type { PlacedBin } from '../../types/bin.ts'

/* 마커는 HTML로 그린다. 색 규칙: 일반 포함 = 세이지, 재활용만 = 버터, 확인 안 됨 = 잉크 소프트 */
const BIN_SVG =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 7.5h13"/><path d="M10 4.5h4"/><path d="M7 7.5l.9 11.2a1.8 1.8 0 0 0 1.8 1.6h4.6a1.8 1.8 0 0 0 1.8-1.6L17 7.5"/></svg>'

function binColor(bin: PlacedBin): string {
  if (bin.waste_kind === 'recycle') return 'bg-butter text-ink'
  if (bin.waste_kind === 'unknown') return 'bg-ink-soft text-paper'
  return 'bg-sage text-paper'
}

export function binIcon(bin: PlacedBin, selected: boolean, isMock: boolean): L.DivIcon {
  const size = selected ? 46 : 36
  const ring = selected ? 'ring-4 ring-butter/70' : ''
  const mock = isMock ? 'outline-2 outline-dashed outline-offset-2 outline-ink-soft/60' : ''
  return L.divIcon({
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    html: `
      <div class="flex flex-col items-center transition-transform" style="width:${size}px">
        <div class="flex items-center justify-center rounded-pill border-[2.5px] border-paper shadow-soft ${binColor(bin)} ${ring} ${mock}" style="width:${size}px;height:${size}px">${BIN_SVG}</div>
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
