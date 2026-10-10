/* 둥근 선 아이콘 규칙: 24px 기준, 선 두께 2.2, 끝·꺾임 모두 round */
export default function WalkIcon({ className }: { className?: string }) {
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
      <circle cx="13" cy="4.5" r="1.8" /><path d="M10 21l2-6 3 3v3" /><path d="M9 11l2.5-3.5 3 1.2 2 3.3" /><path d="M11.5 7.5L10 14" />
    </svg>
  )
}
