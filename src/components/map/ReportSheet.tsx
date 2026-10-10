import { useEffect, useRef, useState } from 'react'
import type { Bin, LatLng, WasteKind } from '../../types/bin.ts'
import { HANGDONG } from '../../config/areas.ts'
import { distanceM } from '../../lib/geo.ts'
import { submitBin } from '../../lib/report.ts'
import { clearDraft, saveDraft, type Draft } from '../../lib/draft.ts'
import { isKakaoInApp, openInExternalBrowserUrl } from '../../lib/inApp.ts'

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
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const dragStartY = useRef<number | null>(null)

  /* 등록 화면이 열려 있는 동안 내용을 기억해 둔다 (카메라 다녀오다 페이지가 꺼질 때 대비) */
  useEffect(() => {
    saveDraft(kind, description)
  }, [kind, description])

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
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-ink/40" onClick={close}>
      <section
        role="dialog"
        aria-label="쓰레기통 등록"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-card bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)]"
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
          className="-mx-5 -mt-3 mb-1 flex h-9 w-[calc(100%+2.5rem)] touch-none items-center justify-center"
        >
          <span className="h-1.5 w-10 rounded-pill bg-line" />
        </button>
        <h2 className="font-display text-[24px] leading-tight text-ink">여기 쓰레기통 등록하기</h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          {me
            ? `지금 내 위치에 등록돼요${accuracyM ? ` · 오차 약 ${Math.round(accuracyM)}m` : ''}`
            : '내 위치를 찾고 있어요'}
        </p>

        {isKakaoInApp && !photo && (
          <div className="mt-3 rounded-2xl bg-butter-light/60 px-3 py-3 text-[13px] leading-snug text-ink">
            <p>
              카카오톡 안에서는 ‘사진 찍기’가 잘 안 될 수 있어요. ‘앨범에서 고르기’를 쓰거나, 다른 브라우저로
              열어 주세요.
            </p>
            <a
              href={openInExternalBrowserUrl('/map')}
              className="mt-2 flex h-11 items-center justify-center rounded-pill bg-ink text-[14px] font-bold text-paper"
            >
              다른 브라우저로 열기
            </a>
          </div>
        )}

        {!isKakaoInApp && restored && !photo && (
          <p className="mt-3 rounded-2xl bg-butter-light/60 px-3 py-2.5 text-[13px] leading-snug text-ink">
            사진을 찍는 동안 화면이 새로 열렸어요. 사진을 다시 골라 주세요. 자꾸 이러면 휴대폰 카메라로
            먼저 찍고 ‘앨범에서 고르기’를 써 주세요.
          </p>
        )}

        {/* 사진: 카메라로 바로 찍기 / 앨범에서 고르기 */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        <input
          ref={albumRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          <button
            type="button"
            onClick={() => albumRef.current?.click()}
            className="mt-4 block h-44 w-full overflow-hidden rounded-card"
          >
            <img src={preview} alt="고른 사진" className="h-full w-full object-cover" />
          </button>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex h-32 flex-1 flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-line bg-cream text-[15px] font-bold text-ink"
            >
              <span className="text-[26px] leading-none">📷</span>
              사진 찍기
            </button>
            <button
              type="button"
              onClick={() => albumRef.current?.click()}
              className="flex h-32 flex-1 flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-line bg-cream text-[15px] font-bold text-ink"
            >
              <span className="text-[26px] leading-none">🖼️</span>
              앨범에서 고르기
            </button>
          </div>
        )}
        {preview && (
          <p className="mt-1 text-center text-[13px] text-ink-soft">사진을 누르면 다른 사진으로 바꿀 수 있어요</p>
        )}

        {/* 종류 */}
        <p className="mt-5 text-[14px] font-semibold text-ink">어떤 쓰레기통인가요?</p>
        <div className="mt-2 flex gap-2">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              className={`h-11 flex-1 rounded-pill text-[14px] font-bold transition ${
                kind === k.value ? 'bg-sage text-paper' : 'bg-cream-deep text-ink-soft'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* 위치 설명 */}
        <label className="mt-5 block text-[14px] font-semibold text-ink" htmlFor="bin-desc">
          어디쯤인가요? <span className="font-normal text-ink-soft">(선택)</span>
        </label>
        <input
          id="bin-desc"
          value={description}
          maxLength={40}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예: 철길 산책로 입구 벤치 옆"
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-cream px-4 text-[16px] text-ink outline-none placeholder:text-ink-soft/70 focus:border-sage"
        />

        <p className="mt-4 rounded-2xl bg-butter-light/50 px-3 py-2.5 text-[13px] leading-snug text-ink">
          등록하면 바로 다른 사람 지도에도 보여요. 배변봉투를 버려도 되는지는 운영자가 확인하기 전까지
          ‘확인 안 됨’으로 표시돼요.
        </p>

        {(blocked || error) && (
          <p className="mt-3 text-[14px] font-medium text-orange">{blocked ?? error}</p>
        )}

        <button
          type="button"
          disabled={!photo || !!blocked || sending}
          onClick={submit}
          className="mt-4 flex h-14 w-full items-center justify-center rounded-pill bg-sage text-[17px] font-bold text-paper shadow-button transition active:scale-[0.98] disabled:bg-line disabled:text-ink-soft disabled:shadow-none"
        >
          {sending ? '올리는 중…' : photo ? '등록하기' : '사진을 먼저 찍어 주세요'}
        </button>
        <button
          type="button"
          onClick={close}
          className="mt-2 h-12 w-full text-[15px] font-medium text-ink-soft"
        >
          취소
        </button>
      </section>
    </div>
  )
}
