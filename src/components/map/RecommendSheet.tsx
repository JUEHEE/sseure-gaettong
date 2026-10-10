import { useEffect, useRef, useState } from 'react'
import type { WasteKind } from '../../types/bin.ts'
import type { LocationState } from '../../hooks/useMyLocation.ts'
import { formatDistance, walkMinutes } from '../../lib/geo.ts'
import { bestBin, kakaoDirectionsUrl } from '../../lib/recommend.ts'
import { spotName, type Place } from '../../lib/places.ts'
import { MascotFace } from '../mascot/Mascot.tsx'
import WalkIcon from '../icons/WalkIcon.tsx'

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
  if (item.distanceM > 3000) return `${item.direction} · 직선 ${formatDistance(item.distanceM)}`
  return `${item.direction} · ${formatDistance(item.distanceM)} · 도보 ${walkMinutes(item.distanceM)}분`
}

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
    <section className="rounded-t-card bg-paper px-5 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[0_-8px_24px_-12px_rgb(63_52_41/0.25)]">
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
        className="-mx-5 flex h-8 w-[calc(100%+2.5rem)] touch-none items-center justify-center"
      >
        <span className="h-1.5 w-10 rounded-pill bg-line" />
      </button>

      {collapsed ? (
        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          className="flex w-full flex-col items-start pb-1 text-left"
        >
          {selected ? (
            <>
              <span className="w-full truncate text-[16px] font-bold text-ink">{selected.place.name}</span>
              {distanceText(selected) && (
                <span className="mt-0.5 flex items-center gap-1.5 text-[14px] text-ink-soft">
                  <WalkIcon className="size-4 shrink-0" />
                  {distanceText(selected)}
                </span>
              )}
            </>
          ) : (
            <span className="text-[15px] font-bold text-ink">
              {location.status === 'loading' ? '내 위치를 찾고 있어요' : '위치를 켜면 가까운 쓰레기통을 알려드려요'}
            </span>
          )}
        </button>
      ) : (
        <>
          {!selected && <LocationMessage location={location} canPickTestLocation={canPickTestLocation} />}

          {selected && main && (
            <>
              {outsideArea && (
                <p className="mb-3 rounded-2xl bg-butter-light/60 px-3 py-2 text-[13px] leading-snug text-ink">
                  지금 위치는 항동 생활권 밖이에요. 가장 가까운 곳을 보여드려요.
                </p>
              )}

              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-sage">
                    {label}
                  </p>
                  <h2 className="mt-1 text-[20px] leading-snug font-bold text-ink">
                    {selected.place.name}
                  </h2>
                  {distanceText(selected) && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-ink-soft">
                      <WalkIcon className="size-[18px] shrink-0" />
                      {distanceText(selected)}
                    </p>
                  )}
                </div>
                {!many && main.photo_url && (
                  <img
                    src={main.photo_url}
                    alt=""
                    className="size-[76px] shrink-0 rounded-2xl object-cover"
                  />
                )}
              </div>

              {many && (
                <div className="mt-3">
                  <p className="text-[13px] font-semibold text-ink-soft">
                    이곳에 쓰레기통 {selected.place.bins.length}개
                  </p>
                  <ul className="-mx-5 mt-1.5 flex gap-2 overflow-x-auto px-5 pb-1">
                    {selected.place.bins.map((bin) => (
                      <li key={bin.id} className="w-[92px] shrink-0">
                        {bin.photo_url ? (
                          <img src={bin.photo_url} alt="" className="h-[92px] w-full rounded-2xl object-cover" />
                        ) : (
                          <div className="h-[92px] w-full rounded-2xl bg-cream-deep" />
                        )}
                        <p className="mt-1 truncate text-center text-[13px] text-ink">{spotName(bin)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-pill bg-sage-light px-2.5 py-1 text-[13px] font-medium text-sage-deep">
                  {WASTE_LABEL[main.waste_kind]}
                </span>
                {main.source === 'user_report' && (
                  <span className="rounded-pill bg-butter-light px-2.5 py-1 text-[13px] font-medium text-ink">
                    사용자 등록
                  </span>
                )}
                <span className="rounded-pill bg-cream-deep px-2.5 py-1 text-[13px] font-medium text-ink-soft">
                  {main.pet_waste_status === 'allowed'
                    ? main.note?.includes('운영자 현장 확인')
                      ? '배변봉투 가능 (운영자 확인)'
                      : '배변봉투 가능 (확인됨)'
                    : '배변봉투 가능 여부 확인 안 됨'}
                </span>
              </div>

              <a
                href={kakaoDirectionsUrl(selected.place)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex h-14 w-full items-center justify-center rounded-pill bg-sage text-[17px] font-bold text-paper shadow-button transition active:scale-[0.98] active:bg-sage-deep"
              >
                카카오맵으로 길찾기
              </a>

              {mineBin && <DeleteMine key={mineBin.id} onDelete={() => props.onDelete(mineBin.id)} />}

              {alternatives.length > 0 && (
                <div className="mt-4">
                  <p className="mb-1.5 text-[13px] font-semibold text-ink-soft">다른 후보</p>
                  <ul className="divide-y divide-line">
                    {alternatives.map((item) => (
                      <li key={item.place.key}>
                        <button
                          type="button"
                          onClick={() => onSelect(item.place)}
                          className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left"
                        >
                          <span className="truncate text-[15px] text-ink">{item.place.name}</span>
                          {item.distanceM !== null && (
                            <span className="shrink-0 text-[14px] text-ink-soft">
                              {formatDistance(item.distanceM)}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
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
        ? { title: '주변에 등록된 쓰레기통이 없어요', body: '새로 발견하면 알려주세요.' }
        : {
            title: '위치를 켜면 가까운 쓰레기통을 알려드려요',
            body: '브라우저 설정에서 위치 권한을 허용해 주세요.',
          }

  return (
    <div className="flex items-center gap-3 pb-2">
      <MascotFace size={48} className="shrink-0" />
      <div>
        <p className="text-[16px] font-bold text-ink">{text.title}</p>
        <p className="mt-0.5 text-[14px] text-ink-soft">{text.body}</p>
        {canPickTestLocation && location.status !== 'loading' && (
          <p className="mt-1 text-[13px] text-sage-deep">테스트: 지도를 누르면 그곳을 내 위치로 정할 수 있어요.</p>
        )}
      </div>
    </div>
  )
}

/* 내가 등록한 쓰레기통 삭제: 한 번 더 확인하고 지운다 */
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
    <div className="mt-3 rounded-2xl bg-cream px-3 py-2">
      <div className="flex min-h-10 items-center justify-between gap-2">
        <span className="text-[13px] text-ink-soft">
          {confirming ? '정말 삭제할까요? 다른 사람 지도에서도 사라져요' : '내가 등록한 쓰레기통이에요'}
        </span>
        {confirming ? (
          <span className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-9 rounded-pill bg-cream-deep px-3 text-[13px] font-bold text-ink-soft"
            >
              취소
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={run}
              className="h-9 rounded-pill bg-orange px-3 text-[13px] font-bold text-paper disabled:opacity-60"
            >
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-9 shrink-0 rounded-pill px-3 text-[13px] font-bold text-orange"
          >
            삭제하기
          </button>
        )}
      </div>
      {error && <p className="pb-1 text-[13px] text-orange">{error}</p>}
    </div>
  )
}
