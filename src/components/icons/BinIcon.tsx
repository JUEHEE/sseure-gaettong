/* 둥근 선 아이콘 규칙: 24px 기준, 선 두께 2.2, 끝·꺾임 모두 round */
export default function BinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.5 7.5h13" /><path d="M10 4.5h4" /><path d="M7 7.5l.9 11.2a1.8 1.8 0 0 0 1.8 1.6h4.6a1.8 1.8 0 0 0 1.8-1.6L17 7.5" /><path d="M10.3 11v5.5M13.7 11v5.5" />
    </svg>
  )
}
