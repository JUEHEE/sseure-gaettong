/* 둥근 선 아이콘 규칙: 24px 기준, 선 두께 2.2, 끝·꺾임 모두 round */
export default function PinIcon({ className }: { className?: string }) {
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
      <path d="M12 21c-3.6-3.4-6.5-6.9-6.5-10.4a6.5 6.5 0 0 1 13 0c0 3.5-2.9 7-6.5 10.4Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  )
}
