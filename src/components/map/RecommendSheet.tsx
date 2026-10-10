import { useEffect, useRef, useState } from 'react'
import type { WasteKind } from '../../types/bin.ts'
import type { LocationState } from '../../hooks/useMyLocation.ts'
import { formatDistance, walkMinutes } from '../../lib/geo.ts'
import { bestBin, kakaoDirectionsUrl } from '../../lib/recommend.ts'
import { spotName, type Place } from '../../lib/places.ts'
import { MascotFace } from '../mascot/Mascot.tsx'
import { ChevronRight, Directions, FigureWalk } from '../icons/Symbols.tsx'

export type SheetItem = { place: Place; distanceM: number | null; direction: string | null }

type Props = {
  location: LocationState
  selected: SheetItem | null
  label: string
  alternatives: SheetItem[]
  outsideArea: boolean
  canPickTestLocation: boolean
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onSelect: (place: Place) => void
  isMine: (binId: string) => boolean
  onDelete: (binId: string) => Promise<void>
}

const WASTE_LABEL: Record<WasteKind, string> = {
  general_and_recycle: '일반+재활용',
  general: '일반쓰레기',
  recycle: '재활용만',
  unknown: '종류 확인 안 됨',
}

/* 걸어갈 만한 거리(3km)까지만 도보 시간을 보여준다. 그보다 멀면 직선거리만 */
function distanceText(item: SheetItem): string | null {
  if (item.distanceM === null) return null
  if (item.distanceM < 15) return '바로 근처예요'
  if (item.distanceM > 3000) return `${item.direction} · 직선 ${formatDistance(item.distanceM)}`
  return `${item.direction} · ${formatDistance(item.distanceM)} · 도보 ${walkMinutes(item.distanceM)}분`
}

/* iOS 시트: 손잡이(grabber) + 묶음 목록(inset grouped) 구성 */
export default function RecommendSheet(props: Props) {
  const { location, selected, label, alternatives, outsideArea, canPickTestLocation, onSelect } = props
  const { collapsed, onCollapsedChange } = props
  const main = selected ? (bestBin(selected.place)?.bin ?? selected.place.bins[0]) : null
  const many = !!selected && selected.place.bins.length > 1
  const mineBin = selected?.place.bins.find((b) => props.isMine(b.id)) ?? null

  /* 손잡이: 아래로 끌면 접고, 위로 끌면 펼치고, 그냥 누르면 바꾼다 */
  const dragStartY = useRef<number | null>(null)
  const onHandleUp = (y: number) => {
    if (dragStartY.current === null) return
    const dy = y - dragStartY.current
    dragStartY.current = null
    if (dy > 30) onCollapsedChange(true)
    else if (dy < -30) onCollapsedChange(false)
    else onCollapsedChange(!collapsed)
  }

  return (
    <section className="rounded-t-[var(--radius-sheet)] bg-cream px-4 pb-[max(env(safe-area-inset-bottom),16px)] shadow-[var(--shadow-sheet)]">
      <button
        type="button"
        aria-label={collapsed ? '카드 펼치기' : '카드 접기'}
        aria-expanded={!collapsed}
        onPointerDown={(e) => {
          dragStartY.current = e.clientY
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerUp={(e) => onHandleUp(e.clientY)}
        onPointerCancel={() => (dragStartY.current = null)}
        className="-mx-4 flex h-6 w-[calc(100%+2rem)] touch-none items-center justify-center"
      >
        <span className="h-[5px] w-9 rounded-pill bg-label-3/60" />
      </button>

      {collapsed ? (
        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          className="flex w-full flex-col items-start px-1 pb-1 text-left"
        >
          {selected ? (
            <>
              <span className="w-full truncate text-[17px] font-semibold tracking-[-0.02em] text-ink">
                {selected.place.name}
              </span>
              {distanceText(selected) && (
                <span className="mt-0.5 flex items-center gap-1 text-[15px] text-label-2">
                  <FigureWalk className="size-4 shrink-0" />
                  {distanceText(selected)}
                </span>
              )}
            </>
          ) : (
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
              {location.status === 'loading' ? '내 위치를 찾고 있어요' : '위치를 켜면 가까운 쓰레기통을 알려드려요'}
            </span>
          )}
        </button>
      ) : (
        <>
          {!selected && <LocationMessage location={location} canPickTestLocation={canPickTestLocation} />}

          {selected && main && (
            <div className="px-1">
              {outsideArea && (
                <p className="mb-3 rounded-xl bg-butter-light/60 px-3 py-2 text-[13px] leading-snug text-ink">
                  지금 위치는 항동 생활권 밖이에요. 가장 가까운 곳을 보여드려요.
                </p>
              )}

              {/* 제목 */}
              <div className="flex gap-3">
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] font-semibold tracking-[-0.01em] text-sage">{label}</p>
                  <h2 className="mt-0.5 text-[22px] leading-[1.25] font-bold tracking-[-0.025em] text-ink">
                    {selected.place.name}
                  </h2>
                  {distanceText(selected) && (
                    <p className="mt-1 flex items-center gap-1 text-[15px] tracking-[-0.01em] text-label-2">
                      <FigureWalk className="size-[17px] shrink-0" />
                      {distanceText(selected)}
                    </p>
                  )}
                </div>
                {!many && main.photo_url && (
                  <img src={main.photo_url} alt="" className="size-[72px] shrink-0 rounded-[14px] object-cover" />
                )}
              </div>

              {/* 같은 자리에 여러 개 */}
              {many && (
                <ul className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
                  {selected.place.bins.map((bin) => (
                    <li key={bin.id} className="w-[84px] shrink-0">
                      {bin.photo_url ? (
                        <img src={bin.photo_url} alt="" className="h-[84px] w-full rounded-[14px] object-cover" />
                      ) : (
                        <div className="h-[84px] w-full rounded-[14px] bg-fill" />
                      )}
                      <p className="mt-1 truncate text-center text-[12px] text-label-2">{spotName(bin)}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* 상태 */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-pill bg-sage-light px-2.5 py-[5px] text-[13px] font-medium text-sage-deep">
                  {WASTE_LABEL[main.waste_kind]}
                </span>
                {main.source === 'user_report' && (
                  <span className="rounded-pill bg-butter-light px-2.5 py-[5px] text-[13px] font-medium text-ink">
                    사용자 등록
                  </span>
                )}
                <span className="rounded-pill bg-fill px-2.5 py-[5px] text-[13px] font-medium text-label-2">
                  {main.pet_waste_status === 'allowed'
                    ? main.note?.includes('운영자 현장 확인')
                      ? '배변봉투 가능 · 운영자 확인'
                      : '배변봉투 가능 · 확인됨'
                    : '배변봉투 가능 여부 확인 안 됨'}
                </span>
              </div>

              <a
                href={kakaoDirectionsUrl(selected.place)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-sage text-[17px] font-semibold tracking-[-0.01em] text-paper transition active:scale-[0.98] active:bg-sage-deep"
              >
                <Directions className="size-5" />
                카카오맵으로 길찾기
              </a>

              {mineBin && <DeleteMine key={mineBin.id} onDelete={() => props.onDelete(mineBin.id)} />}

              {alternatives.length > 0 && (
                <div className="mt-5">
                  <p className="mb-1.5 px-4 text-[13px] text-label-2">다른 후보</p>
                  <ul className="overflow-hidden rounded-[var(--radius-control)] bg-group">
                    {alternatives.map((item, i) => (
                      <li key={item.place.key}>
                        <button
                          type="button"
                          onClick={() => onSelect(item.place)}
                          className="flex min-h-12 w-full items-center gap-2 pl-4 text-left active:bg-fill"
                        >
                          <span
                            className={`flex min-h-12 flex-1 items-center gap-2 pr-3 ${i > 0 ? 'border-t-[0.5px] border-separator' : ''}`}
                          >
                            <span className="min-w-0 flex-1 truncate text-[16px] tracking-[-0.01em] text-ink">
                              {item.place.name}
                            </span>
                            {item.distanceM !== null && (
                              <span className="shrink-0 text-[15px] text-label-2">{formatDistance(item.distanceM)}</span>
                            )}
                            <ChevronRight className="size-3.5 shrink-0 text-label-3" />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function LocationMessage({
  location,
  canPickTestLocation,
}: {
  location: LocationState
  canPickTestLocation: boolean
}) {
  const text =
    location.status === 'loading'
      ? { title: '내 위치를 찾고 있어요', body: '잠시만 기다려 주세요.' }
      : location.status === 'ok'
        ? { title: '주변에 등록된 쓰레기통이 없어요', body: '새로 발견하면 등록해 주세요.' }
        : {
            title: '위치를 켜면 가까운 쓰레기통을 알려드려요',
            body: '브라우저 설정에서 위치 권한을 허용해 주세요.',
          }

  return (
    <div className="flex items-center gap-3 px-1 pb-2">
      <MascotFace size={44} className="shrink-0" />
      <div>
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{text.title}</p>
        <p className="mt-0.5 text-[15px] text-label-2">{text.body}</p>
        {canPickTestLocation && location.status !== 'loading' && (
          <p className="mt-1 text-[13px] text-sage-deep">테스트: 지도를 누르면 그곳을 내 위치로 정할 수 있어요.</p>
        )}
      </div>
    </div>
  )
}

/* 내가 등록한 쓰레기통 삭제: iOS 목록 한 줄 + 한 번 더 확인 */
function DeleteMine({ onDelete }: { onDelete: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!confirming) return
    const timer = setTimeout(() => setConfirming(false), 5000)
    return () => clearTimeout(timer)
  }, [confirming])

  const run = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onDelete()
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제하지 못했어요')
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="mt-3">
      <div className="flex min-h-12 items-center justify-between gap-2 rounded-[var(--radius-control)] bg-group pr-2 pl-4">
        <span className="text-[15px] text-label-2">
          {confirming ? '다른 사람 지도에서도 사라져요' : '내가 등록한 쓰레기통'}
        </span>
        {confirming ? (
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-9 rounded-lg px-3 text-[15px] text-label-2"
            >
              취소
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={run}
              className="h-9 rounded-lg px-3 text-[15px] font-semibold text-danger disabled:opacity-50"
            >
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-9 shrink-0 rounded-lg px-3 text-[15px] text-danger"
          >
            삭제하기
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 px-4 text-[13px] text-danger">{error}</p>}
    </div>
  )
}
