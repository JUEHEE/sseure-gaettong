import { useEffect, useRef, useState } from 'react'
import type { Bin, LatLng, WasteKind } from '../../types/bin.ts'
import { HANGDONG } from '../../config/areas.ts'
import { distanceM } from '../../lib/geo.ts'
import { submitBin } from '../../lib/report.ts'
import { clearDraft, saveDraft, type Draft } from '../../lib/draft.ts'
import { isKakaoInApp, openInExternalBrowserUrl } from '../../lib/inApp.ts'
import { LocationArrow } from '../icons/Symbols.tsx'
import { CameraSticker } from '../icons/Stickers.tsx'

type Props = {
  me: LatLng | null
  accuracyM: number | null
  restored: Draft | null
  onClose: () => void
  onDone: (bin: Bin) => void
}

const KINDS: { value: WasteKind; label: string }[] = [
  { value: 'general', label: '일반쓰레기' },
  { value: 'recycle', label: '재활용' },
  { value: 'unknown', label: '잘 모르겠어요' },
]

export default function ReportSheet({ me, accuracyM, restored, onClose, onDone }: Props) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [kind, setKind] = useState<WasteKind>(restored?.kind ?? 'general')
  const [description, setDescription] = useState(restored?.description ?? '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const dragStartY = useRef<number | null>(null)

  /* 등록 화면이 열려 있는 동안 내용을 기억해 둔다 (카메라 다녀오다 페이지가 꺼질 때 대비) */
  useEffect(() => {
    saveDraft(kind, description)
  }, [kind, description])

  /* 뒤로가기 등으로 화면을 벗어나면 기억도 지운다 (페이지가 꺼질 때는 실행되지 않아서 복원은 그대로 동작) */
  useEffect(() => () => clearDraft(), [])

  const close = () => {
    clearDraft()
    onClose()
  }

  useEffect(() => {
    if (!photo) return
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const outside = !!me && distanceM(me, HANGDONG.center) > HANGDONG.radiusM
  const blocked = !me
    ? '내 위치를 찾은 뒤에 등록할 수 있어요.'
    : outside
      ? '지금은 항동 생활권 안에서만 등록할 수 있어요.'
      : null

  const submit = async () => {
    if (!me || !photo || blocked) return
    setSending(true)
    setError(null)
    try {
      const bin = await submitBin({ position: me, photo, wasteKind: kind, description })
      clearDraft()
      onDone(bin)
    } catch (e) {
      setError(e instanceof Error ? e.message : '등록하지 못했어요')
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-ink/30" onClick={close}>
      <section
        role="dialog"
        aria-label="쓰레기통 등록"
        onClick={(e) => e.stopPropagation()}
        className="sheet-up max-h-[94dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[var(--radius-sheet)] bg-cream px-4 pb-[max(env(safe-area-inset-bottom),16px)]"
      >
        {/* 손잡이: 아래로 끌거나 누르면 닫힌다 */}
        <button
          type="button"
          aria-label="등록 화면 닫기"
          onPointerDown={(e) => {
            dragStartY.current = e.clientY
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerUp={(e) => {
            const start = dragStartY.current
            dragStartY.current = null
            if (start !== null && e.clientY - start > -10) close()
          }}
          onPointerCancel={() => (dragStartY.current = null)}
          className="-mx-4 flex h-6 w-[calc(100%+2rem)] touch-none items-center justify-center"
        >
          <span className="h-[5px] w-9 rounded-pill bg-label-3/60" />
        </button>

        {/* iOS 내비게이션 바: 취소 · 제목 */}
        <div className="grid h-11 grid-cols-[1fr_auto_1fr] items-center">
          <button type="button" onClick={close} className="justify-self-start px-1 text-[17px] text-sage">
            취소
          </button>
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">쓰레기통 등록</h2>
          <span />
        </div>

        {isKakaoInApp && !photo && (
          <div className="mt-2 rounded-[var(--radius-control)] bg-group px-4 py-3">
            <p className="text-[14px] leading-snug text-label-2">
              카카오톡 안에서는 카메라로 바로 찍으면 잘 안 될 수 있어요. 앨범에서 고르거나 다른 브라우저로 열어 주세요.
            </p>
            <a
              href={openInExternalBrowserUrl('/map')}
              className="mt-1.5 inline-block text-[15px] font-semibold text-sage"
            >
              다른 브라우저로 열기
            </a>
          </div>
        )}

        {!isKakaoInApp && restored && !photo && (
          <p className="mt-2 rounded-[var(--radius-control)] bg-group px-4 py-3 text-[14px] leading-snug text-label-2">
            사진을 찍는 동안 화면이 새로 열렸어요. 사진을 다시 골라 주세요. 자꾸 이러면 휴대폰 카메라로 먼저 찍고
            앨범에서 골라 주세요.
          </p>
        )}

        {/* 사진: 버튼 하나. 누르면 휴대폰이 카메라·앨범 중 고르게 해 준다 */}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          <div className="relative mt-3">
            <img src={preview} alt="고른 사진" className="h-52 w-full rounded-[22px] object-cover" />
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="glass absolute right-2.5 bottom-2.5 h-9 rounded-pill px-3.5 text-[14px] font-semibold text-ink"
            >
              다시 고르기
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="mt-3 flex h-[168px] w-full flex-col items-center justify-center rounded-[22px] bg-group transition active:scale-[0.98] active:bg-fill"
          >
            <CameraSticker className="size-[76px]" />
            <span className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-ink">사진 올리기</span>
            <span className="mt-0.5 text-[13px] text-label-2">카메라로 찍거나 앨범에서 골라요</span>
          </button>
        )}

        {/* 위치 */}
        <p className="mt-5 mb-1.5 px-4 text-[13px] text-label-2">위치</p>
        <div className="flex min-h-12 items-center gap-2.5 rounded-[var(--radius-control)] bg-group px-4">
          <LocationArrow className="size-[18px] shrink-0 text-sage" />
          <span className="flex-1 text-[16px] tracking-[-0.01em] text-ink">
            {me ? '지금 내 위치' : '내 위치를 찾고 있어요'}
          </span>
          {accuracyM !== null && (
            <span className="text-[15px] text-label-2">오차 약 {Math.round(accuracyM)}m</span>
          )}
        </div>

        {/* 종류: iOS 세그먼트 */}
        <p className="mt-5 mb-1.5 px-4 text-[13px] text-label-2">어떤 쓰레기통인가요?</p>
        <div role="radiogroup" className="flex h-9 rounded-[10px] bg-fill p-[2px]">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              role="radio"
              aria-checked={kind === k.value}
              onClick={() => setKind(k.value)}
              className={`flex-1 rounded-[8px] text-[13px] font-semibold tracking-[-0.01em] transition ${
                kind === k.value ? 'bg-paper text-ink shadow-[0_1px_4px_rgb(63_52_41/0.14)]' : 'text-label-2'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* 위치 설명 */}
        <label className="mt-5 mb-1.5 block px-4 text-[13px] text-label-2" htmlFor="bin-desc">
          어디쯤인가요? (선택)
        </label>
        <input
          id="bin-desc"
          value={description}
          maxLength={40}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예: 철길 산책로 입구 벤치 옆"
          className="h-12 w-full rounded-[var(--radius-control)] bg-group px-4 text-[17px] tracking-[-0.01em] text-ink outline-none placeholder:text-label-3"
        />
        <p className="mt-1.5 px-4 text-[13px] leading-snug text-label-2">
          등록하면 바로 다른 사람 지도에도 보여요. 배변봉투를 버려도 되는지는 운영자가 확인하기 전까지 ‘확인 안 됨’으로
          표시돼요.
        </p>

        {(blocked || error) && <p className="mt-3 px-4 text-[14px] text-danger">{blocked ?? error}</p>}

        <button
          type="button"
          disabled={!photo || !!blocked || sending}
          onClick={submit}
          className="mt-5 flex h-[50px] w-full items-center justify-center rounded-[var(--radius-control)] bg-sage text-[17px] font-semibold tracking-[-0.01em] text-paper transition active:scale-[0.98] disabled:bg-fill disabled:text-label-3"
        >
          {sending ? '올리는 중…' : photo ? '등록하기' : '사진을 먼저 골라 주세요'}
        </button>
      </section>
    </div>
  )
}
