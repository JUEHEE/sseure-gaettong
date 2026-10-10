import type { ReactNode } from 'react'

/*
 * iOS 시스템 아이콘(SF Symbols) 느낌의 아이콘 모음.
 * 규칙: 24px 기준, 선 1.8~2.4, 끝·꺾임 모두 둥글게, 이모지 쓰지 않기. (docs/design.md 4절)
 */
type IconProps = { className?: string }

function Symbol({ className, children, strokeWidth = 1.9 }: IconProps & { children: ReactNode; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/* chevron.left — 뒤로 */
export const ChevronLeft = (p: IconProps) => (
  <Symbol {...p} strokeWidth={2.6}>
    <path d="M14.5 4.5 7 12l7.5 7.5" />
  </Symbol>
)

/* chevron.right — 목록 끝 */
export const ChevronRight = (p: IconProps) => (
  <Symbol {...p} strokeWidth={2.4}>
    <path d="m9.5 5 7 7-7 7" />
  </Symbol>
)

/* plus */
export const Plus = (p: IconProps) => (
  <Symbol {...p} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </Symbol>
)

/* location.fill — 내 위치 */
export const LocationArrow = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M19.9 3.3 4.3 9.9c-.9.4-.8 1.7.1 2l6.3 1.8 1.8 6.3c.3 1 1.6 1 2 .1l6.6-15.6c.3-.8-.4-1.5-1.2-1.2Z"
    />
  </svg>
)

/* mappin — 장소 찾기 */
export const MapPin = (p: IconProps) => (
  <Symbol {...p} strokeWidth={2}>
    <path d="M12 21c-3.6-3.4-6.5-6.9-6.5-10.4a6.5 6.5 0 0 1 13 0c0 3.5-2.9 7-6.5 10.4Z" />
    <circle cx="12" cy="10.5" r="2.3" />
  </Symbol>
)

/* camera */
export const Camera = (p: IconProps) => (
  <Symbol {...p} strokeWidth={1.8}>
    <path d="M3.8 9A2.5 2.5 0 0 1 6.3 6.5h1.6l1.3-1.9a1.5 1.5 0 0 1 1.2-.6h3.2a1.5 1.5 0 0 1 1.2.6l1.3 1.9h1.6A2.5 2.5 0 0 1 20.2 9v8a2.5 2.5 0 0 1-2.5 2.5H6.3A2.5 2.5 0 0 1 3.8 17Z" />
    <circle cx="12" cy="12.8" r="3.3" />
  </Symbol>
)

/* photo.on.rectangle — 앨범 */
export const Photos = (p: IconProps) => (
  <Symbol {...p} strokeWidth={1.8}>
    <path d="M7.5 4.5h10A2.5 2.5 0 0 1 20 7v9" />
    <rect x="3.5" y="7.5" width="13" height="12" rx="2.5" />
    <path d="m3.8 17.2 3.4-3.4a1.2 1.2 0 0 1 1.7 0l2.6 2.6 1.3-1.3a1.2 1.2 0 0 1 1.7 0l1.8 1.8" />
    <circle cx="12.6" cy="11.3" r="1.2" />
  </Symbol>
)

/* figure.walk — 도보 */
export const FigureWalk = (p: IconProps) => (
  <Symbol {...p} strokeWidth={2}>
    <circle cx="13.6" cy="4.4" r="1.8" />
    <path d="m9.6 21 2.4-6.4 2.8 2.6V21" />
    <path d="m7.6 12.4 1.6-3.7a1.8 1.8 0 0 1 1.9-1l1.7.3a1.8 1.8 0 0 1 1.3 1l1.4 2.7 2.3 1" />
    <path d="m11.3 8-1.5 6.8" />
  </Symbol>
)

/* arrow.triangle.turn.up.right.diamond — 길찾기 */
export const Directions = (p: IconProps) => (
  <Symbol {...p} strokeWidth={1.9}>
    <path d="M10.6 3.4a2 2 0 0 1 2.8 0l7.2 7.2a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1 0-2.8Z" />
    <path d="M9.3 15v-2.3a1.7 1.7 0 0 1 1.7-1.7h4.3" />
    <path d="m13.4 9 2 2-2 2" />
  </Symbol>
)

/* trash */
export const Trash = (p: IconProps) => (
  <Symbol {...p} strokeWidth={1.9}>
    <path d="M4.5 6.5h15" />
    <path d="M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
    <path d="m6.3 6.5.9 12.2a2 2 0 0 0 2 1.8h5.6a2 2 0 0 0 2-1.8l.9-12.2" />
    <path d="M10 10.5v6M14 10.5v6" />
  </Symbol>
)
