import { DOG } from '../mascot/Mascot.tsx'
import type { WasteKind } from '../../types/bin.ts'

/*
 * 스티커 아이콘 — 마스코트 강아지와 같은 화풍 (docs/design.md 4절)
 * 초코색 외곽선 + 크림·세이지·버터 면. 화면의 "얼굴"이 되는 곳에만 쓰고,
 * 뒤로가기·목록 화살표 같은 작은 기능 아이콘은 Symbols.tsx의 iOS 기본 모양을 쓴다.
 */

/* 쓰레기통 종류별 색 */
export const BIN_COLORS: Record<WasteKind, { body: string; lid: string }> = {
  general: { body: '#A9BB8A', lid: '#657A4E' },
  general_and_recycle: { body: '#A9BB8A', lid: '#657A4E' },
  recycle: { body: '#F2CF72', lid: '#C99A2E' },
  unknown: { body: '#E2D8C6', lid: '#A8998A' },
}

/* 쓰레기통 스티커를 SVG 문자열로 (지도 마커는 HTML 문자열로 그려야 해서) */
export function binStickerSvg(kind: WasteKind, size = 26): string {
  const { body, lid } = BIN_COLORS[kind]
  return `<svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true">
    <g stroke="${DOG.line}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13.4 9.6V8.2a1.6 1.6 0 0 1 1.6-1.6h2a1.6 1.6 0 0 1 1.6 1.6v1.4" fill="none"/>
      <path d="M9 13h14l-1.4 12.6a2.4 2.4 0 0 1-2.4 2.1h-6.4a2.4 2.4 0 0 1-2.4-2.1Z" fill="${body}"/>
      <rect x="7" y="9.6" width="18" height="3.6" rx="1.8" fill="${lid}"/>
    </g>
    <g fill="${DOG.muzzle}">
      <ellipse cx="16" cy="21.8" rx="2.3" ry="1.9"/>
      <circle cx="13.3" cy="18.6" r="0.95"/><circle cx="15.1" cy="17.4" r="0.95"/>
      <circle cx="16.9" cy="17.4" r="0.95"/><circle cx="18.7" cy="18.6" r="0.95"/>
    </g>
  </svg>`
}

export function BinSticker({ kind = 'general', className }: { kind?: WasteKind; className?: string }) {
  return <span className={`inline-flex ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: binStickerSvg(kind, 32) }} />
}

/* 발바닥 — 도보 거리, 홈 버튼 */
export function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 11.4c2.7 0 5.2 2.7 5.2 4.9 0 1.7-1.3 2.7-2.8 2.7-1 0-1.6-.5-2.4-.5s-1.4.5-2.4.5c-1.5 0-2.8-1-2.8-2.7 0-2.2 2.5-4.9 5.2-4.9Z" />
      <ellipse cx="6.4" cy="10.4" rx="1.8" ry="2.2" transform="rotate(-22 6.4 10.4)" />
      <ellipse cx="9.7" cy="6.8" rx="1.9" ry="2.4" transform="rotate(-8 9.7 6.8)" />
      <ellipse cx="14.3" cy="6.8" rx="1.9" ry="2.4" transform="rotate(8 14.3 6.8)" />
      <ellipse cx="17.6" cy="10.4" rx="1.8" ry="2.2" transform="rotate(22 17.6 10.4)" />
    </svg>
  )
}
