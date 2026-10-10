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

/* location.fill — 내 위치 */
export const LocationArrow = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M19.9 3.3 4.3 9.9c-.9.4-.8 1.7.1 2l6.3 1.8 1.8 6.3c.3 1 1.6 1 2 .1l6.6-15.6c.3-.8-.4-1.5-1.2-1.2Z"
    />
  </svg>
)

/* arrow.triangle.turn.up.right.diamond — 길찾기 */
export const Directions = (p: IconProps) => (
  <Symbol {...p} strokeWidth={1.9}>
    <path d="M10.6 3.4a2 2 0 0 1 2.8 0l7.2 7.2a2 2 0 0 1 0 2.8l-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1 0-2.8Z" />
    <path d="M9.3 15v-2.3a1.7 1.7 0 0 1 1.7-1.7h4.3" />
    <path d="m13.4 9 2 2-2 2" />
  </Symbol>
)

/* camera — 사진 올리기 */
export const Camera = (p: IconProps) => (
  <Symbol {...p} strokeWidth={1.8}>
    <path d="M3.8 9A2.5 2.5 0 0 1 6.3 6.5h1.6l1.3-1.9a1.5 1.5 0 0 1 1.2-.6h3.2a1.5 1.5 0 0 1 1.2.6l1.3 1.9h1.6A2.5 2.5 0 0 1 20.2 9v8a2.5 2.5 0 0 1-2.5 2.5H6.3A2.5 2.5 0 0 1 3.8 17Z" />
    <circle cx="12" cy="12.8" r="3.3" />
  </Symbol>
)
