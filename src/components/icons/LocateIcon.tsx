/* 둥근 선 아이콘 규칙: 24px 기준, 선 두께 2.2, 끝·꺾임 모두 round */
export default function LocateIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  )
}
