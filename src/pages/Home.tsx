import { MascotFace, MascotRunning } from '../components/mascot/Mascot.tsx'
import { MapPin } from '../components/icons/Symbols.tsx'
import { go } from '../hooks/useRoute.ts'
import { useBins } from '../hooks/useBins.ts'

export default function Home() {
  const { bins } = useBins()

  return (
    <div className="flex min-h-dvh justify-center bg-cream">
      <main className="flex w-full max-w-[430px] flex-col px-5 pt-[max(env(safe-area-inset-top),10px)] pb-[max(env(safe-area-inset-bottom),20px)]">
        {/* 상단: 로고 */}
        <header className="flex h-12 items-center gap-2">
          <MascotFace size={28} />
          <span className="font-display text-[19px] leading-none text-ink">쓰레개똥</span>
        </header>

        {/* 큰 제목 (iOS Large Title) */}
        <section className="mt-5">
          <h1 className="text-[34px] leading-[1.18] font-bold tracking-[-0.025em] text-ink">
            개똥은 치웠는데,
            <br />
            <span className="text-sage">어디다 버리지?</span>
          </h1>
          <p className="mt-2.5 text-[17px] leading-snug tracking-[-0.01em] text-label-2">
            산책하다가 발견한 쓰레기통을 찾아보세요.
          </p>
        </section>

        {/* 달리는 강아지 */}
        <div className="mt-6 flex min-h-[230px] flex-1 items-center justify-center overflow-hidden rounded-[32px] bg-[#F4E5BA]">
          <MascotRunning className="w-full max-w-[380px] px-2" />
        </div>

        {/* 주요 행동: iOS 캡슐 버튼 + 작은 설명 (엄지가 닿는 아래쪽) */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => go('map')}
            className="flex h-[50px] items-center gap-2 rounded-pill bg-sage pr-6 pl-5 text-[17px] font-semibold tracking-[-0.015em] text-paper shadow-[0_6px_16px_-8px_rgb(82_100_63/0.6)] transition active:scale-[0.97] active:bg-sage-deep"
          >
            <MapPin className="size-5" />
            내 주변 쓰레기통 찾기
          </button>
          <p className="text-[13px] tracking-[-0.01em] text-label-2">
            항동 생활권 · 쓰레기통 {bins.length}곳
          </p>
        </div>
      </main>
    </div>
  )
}
