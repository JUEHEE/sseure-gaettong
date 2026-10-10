import { MascotFace, MascotWalkingWithBag } from '../components/mascot/Mascot.tsx'
import PinIcon from '../components/icons/PinIcon.tsx'
import { go } from '../hooks/useHashRoute.ts'

export default function Home() {
  return (
    <div className="flex min-h-dvh justify-center bg-cream">
      <main className="relative flex w-full max-w-[430px] flex-col px-6 pt-[max(env(safe-area-inset-top),12px)] pb-[max(env(safe-area-inset-bottom),24px)]">
        {/* 상단: 로고 */}
        <header className="flex h-14 items-center gap-2">
          <MascotFace size={34} />
          <span className="font-display text-[21px] leading-none text-ink">쓰레개똥</span>
        </header>

        {/* 메인 문구 */}
        <section className="mt-7">
          <h1 className="font-display text-[38px] leading-[1.22] tracking-[-0.01em] text-ink">
            개똥은 치웠는데,
            <br />
            <span className="-mx-1 rounded-md bg-[linear-gradient(transparent_56%,var(--color-butter-light)_56%)] px-1">
              어디다 버리지?
            </span>
          </h1>
          <p className="mt-4 text-[16px] leading-[1.5] text-ink-soft">
            산책하다가 발견한 쓰레기통을 찾아보세요.
          </p>
        </section>

        {/* 메인 일러스트 */}
        <div className="-mx-3 flex min-h-[220px] flex-1 items-center justify-center py-4">
          <MascotWalkingWithBag className="max-h-full w-full max-w-[380px]" />
        </div>

        {/* 주요 행동: 엄지가 닿는 화면 아래쪽에 둔다 */}
        <button
          type="button"
          onClick={() => go('map')}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-pill bg-sage text-[18px] font-bold text-paper shadow-button transition active:scale-[0.98] active:bg-sage-deep focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-butter"
        >
          <span className="flex size-9 items-center justify-center rounded-pill bg-paper/20">
            <PinIcon className="size-5" />
          </span>
          내 주변 쓰레기통 찾기
        </button>
      </main>
    </div>
  )
}
