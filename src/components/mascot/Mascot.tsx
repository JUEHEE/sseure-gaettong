import { useId } from 'react'

/*
 * 쓰레개똥 마스코트 강아지
 * 캐릭터 규칙(비율, 색, 선)은 docs/design.md의 "마스코트" 절을 따른다.
 * 새 포즈를 추가할 때도 아래 DOG 값과 HandDrawnFilter를 그대로 사용한다.
 */
export const DOG = {
  line: '#3F3429', // 외곽선: 잉크 브라운, 선 끝은 항상 둥글게
  fur: '#F8EAD0', // 몸·머리: 크림
  furShade: '#ECD8B4', // 뒤쪽 다리처럼 한 단계 뒤에 있는 부분
  muzzle: '#FFF7E8', // 주둥이
  ear: '#8A5A3B', // 귀·등 무늬: 초코
  blush: '#D9824B', // 볼터치 (투명도 0.4)
  collar: '#D9824B', // 목줄·리드줄: 오렌지
  bag: '#9DB07C', // 배변봉투: 세이지
} as const

/* 선이 살짝 흔들리는 손그림 느낌. 강도는 scale로 조절 (과하면 지저분해진다) */
function HandDrawnFilter({ id, scale = 2 }: { id: string; scale?: number }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
      <feDisplacementMap in="SourceGraphic" scale={scale} />
    </filter>
  )
}

type MascotProps = { size?: number; className?: string }

/* 정면 얼굴 — 로고, 작은 아이콘, 빈 상태 화면 등에 사용 */
export function MascotFace({ size = 40, className }: MascotProps) {
  const filterId = useId()
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <HandDrawnFilter id={filterId} scale={1.2} />
      </defs>
      <g
        filter={`url(#${filterId})`}
        stroke={DOG.line}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="32" cy="35" rx="21" ry="19" fill={DOG.fur} />
        <path d="M18 19 C9 20 5 31 8 41 C10 47 17 47 19 41 C21 34 22 26 23 21 Z" fill={DOG.ear} />
        <path d="M46 19 C55 20 59 31 56 41 C54 47 47 47 45 41 C43 34 42 26 41 21 Z" fill={DOG.ear} />
        <ellipse cx="32" cy="43" rx="9" ry="6.5" fill={DOG.muzzle} />
        <ellipse cx="32" cy="39.6" rx="3.3" ry="2.4" fill={DOG.line} stroke="none" />
        <path d="M28.6 43.4 Q30.4 45.6 32 43.6 Q33.6 45.6 35.4 43.4" fill="none" strokeWidth={1.8} />
      </g>
      <circle cx="24.5" cy="33" r="2.3" fill={DOG.line} />
      <circle cx="39.5" cy="33" r="2.3" fill={DOG.line} />
      <ellipse cx="21" cy="39.5" rx="3" ry="1.8" fill={DOG.blush} opacity="0.4" />
      <ellipse cx="43" cy="39.5" rx="3" ry="1.8" fill={DOG.blush} opacity="0.4" />
    </svg>
  )
}

/*
 * 달리는 강아지 — 홈 메인 일러스트 (0.64초 반복)
 * 다리는 앞·뒤가 엇갈려 흔들리고, 몸은 위아래로, 귀·꼬리·봉투는 한 박자 늦게 따라온다.
 * 움직임 정의는 src/styles/index.css의 run-* 애니메이션. '동작 줄이기' 설정이면 멈춘다.
 * 움직이는 그림이라 손그림 필터는 쓰지 않는다 (휴대폰에서 버벅이지 않게).
 */
export function MascotRunning({ className }: { className?: string }) {
  const uid = useId()
  const bodyClipId = `${uid}-body`
  const bodyPath =
    'M98 152 C96 128 122 118 152 120 C184 122 210 130 212 154 C214 178 196 194 160 195 C122 196 100 180 98 152 Z'
  const line = { stroke: DOG.line, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

  return (
    <svg viewBox="24 56 280 186" className={`run ${className ?? ''}`} role="img" aria-label="배변봉투를 물고 달리는 강아지">
      <defs>
        <clipPath id={bodyClipId}>
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {/* 땅: 점선이 왼쪽으로 흘러가서 달리는 것처럼 보인다 */}
      <g className="run-ground" stroke="#CDBFA6" strokeWidth={3} strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M${20 + i * 64} 222 h28`} />
        ))}
      </g>
      <ellipse className="run-shadow" cx="160" cy="221" rx="66" ry="6" fill="#3F3429" opacity="0.14" />

      {/* 속도선 */}
      <g stroke="#CDBFA6" strokeWidth={3} strokeLinecap="round">
        <path className="run-speed" d="M44 128 h26" />
        <path className="run-speed run-speed-2" d="M30 154 h34" />
        <path className="run-speed run-speed-3" d="M50 180 h20" />
      </g>

      <g transform="translate(-12 6)">
        <g className="run-body">
          {/* 뒤쪽 다리 (한 톤 어둡게) */}
          <rect className="run-leg-b run-late" x="122" y="168" width="16" height="40" rx="8" fill={DOG.furShade} {...line} style={{ transformOrigin: '130px 172px' }} />
          <rect className="run-leg-a run-late" x="188" y="166" width="16" height="40" rx="8" fill={DOG.furShade} {...line} style={{ transformOrigin: '196px 170px' }} />

          {/* 꼬리 */}
          <path
            className="run-tail"
            d="M102 146 C86 142 80 126 86 114 C89 109 95 111 94 117 C93 128 99 136 108 138 Z"
            fill={DOG.fur}
            {...line}
            style={{ transformOrigin: '104px 142px' }}
          />

          {/* 앞쪽 다리 */}
          <rect className="run-leg-a" x="104" y="170" width="17" height="42" rx="8.5" fill={DOG.fur} {...line} style={{ transformOrigin: '112px 174px' }} />
          <rect className="run-leg-b" x="168" y="170" width="17" height="42" rx="8.5" fill={DOG.fur} {...line} style={{ transformOrigin: '176px 174px' }} />

          {/* 몸 + 등 무늬 */}
          <path d={bodyPath} fill={DOG.fur} />
          <g clipPath={`url(#${bodyClipId})`}>
            <ellipse cx="130" cy="132" rx="20" ry="12" fill={DOG.ear} />
          </g>
          <path d={bodyPath} fill="none" {...line} />

          {/* 머리: 몸보다 살짝 늦게 끄덕인다 */}
          <g className="run-head" style={{ transformOrigin: '190px 136px' }}>
            {/* 입에 문 배변봉투: 대롱대롱 */}
            <g className="run-bag" style={{ transformOrigin: '244px 132px' }}>
              <path d="M244 141 C237 136 236 129 242 129 M244 141 C251 136 252 129 246 129" fill="none" {...line} strokeWidth={2.4} />
              <path d="M238 143 C229 156 229 172 240 178 C252 184 265 174 263 160 C261 151 256 146 250 143 Z" fill={DOG.bag} {...line} />
              <path d="M238 143 Q244 147 250 143" fill="none" {...line} strokeWidth={2.4} />
            </g>
            <circle cx="206" cy="106" r="40" fill={DOG.fur} {...line} />
            <path
              className="run-ear"
              d="M186 74 C166 74 154 98 158 122 C161 138 178 140 184 128 C190 114 196 94 198 80 Z"
              fill={DOG.ear}
              {...line}
              style={{ transformOrigin: '192px 78px' }}
            />
            <ellipse cx="232" cy="120" rx="19" ry="14" fill={DOG.muzzle} {...line} />
            <ellipse cx="249" cy="112" rx="6.5" ry="5" fill={DOG.line} />
            <path d="M236 127 Q242 131 248 127" fill="none" {...line} strokeWidth={2.4} />
            <path d="M180 132 C188 142 200 147 214 146" fill="none" stroke={DOG.collar} strokeWidth={6} strokeLinecap="round" />
            <circle cx="216" cy="98" r="4.6" fill={DOG.line} />
            <circle cx="217.6" cy="96.4" r="1.4" fill="#FFFDF8" />
            <ellipse cx="219" cy="119" rx="7" ry="4" fill={DOG.blush} opacity="0.4" />
          </g>
        </g>
      </g>
    </svg>
  )
}
