import { MascotFace, MascotRunning } from '../components/mascot/Mascot.tsx'
import { MapPin } from '../components/icons/Symbols.tsx'
import { go } from '../hooks/useRoute.ts'

export default function Home() {
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

        {/* 주요 행동: 엄지가 닿는 아래쪽 */}
        <button
          type="button"
          onClick={() => go('map')}
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sage text-[17px] font-semibold tracking-[-0.01em] text-paper transition active:scale-[0.98] active:bg-sage-deep"
        >
          <MapPin className="size-[21px]" />
          내 주변 쓰레기통 찾기
        </button>
      </main>
    </div>
  )
}
