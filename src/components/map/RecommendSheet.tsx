import type { PlacedBin, WasteKind } from '../../types/bin.ts'
import type { LocationState } from '../../hooks/useMyLocation.ts'
import { formatDistance, walkMinutes } from '../../lib/geo.ts'
import { kakaoDirectionsUrl } from '../../lib/recommend.ts'
import { MascotFace } from '../mascot/Mascot.tsx'
import WalkIcon from '../icons/WalkIcon.tsx'

export type SheetItem = { bin: PlacedBin; distanceM: number | null; direction: string | null }

type Props = {
  location: LocationState
  selected: SheetItem | null
  label: string
  alternatives: SheetItem[]
  outsideArea: boolean
  canPickTestLocation: boolean
  onSelect: (bin: PlacedBin) => void
}

const WASTE_LABEL: Record<WasteKind, string> = {
  general_and_recycle: '일반+재활용',
  general: '일반쓰레기',
  recycle: '재활용만',
  unknown: '종류 확인 안 됨',
}

function distanceText(item: SheetItem): string | null {
  if (item.distanceM === null) return null
  return `${item.direction} · ${formatDistance(item.distanceM)} · 도보 ${walkMinutes(item.distanceM)}분`
}

export default function RecommendSheet(props: Props) {
  const { location, selected, label, alternatives, outsideArea, canPickTestLocation, onSelect } = props

  return (
    <section className="rounded-t-card bg-paper px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)] shadow-[0_-8px_24px_-12px_rgb(63_52_41/0.25)]">
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-pill bg-line" />

      {!selected && <LocationMessage location={location} canPickTestLocation={canPickTestLocation} />}

      {selected && (
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
                {selected.bin.detail_location}
              </h2>
              {distanceText(selected) && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-ink-soft">
                  <WalkIcon className="size-[18px] shrink-0" />
                  {distanceText(selected)}
                </p>
              )}
            </div>
            {selected.bin.photo_url && (
              <img
                src={selected.bin.photo_url}
                alt=""
                className="size-[76px] shrink-0 rounded-2xl object-cover"
              />
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-pill bg-sage-light px-2.5 py-1 text-[13px] font-medium text-sage-deep">
              {WASTE_LABEL[selected.bin.waste_kind]}
            </span>
            <span className="rounded-pill bg-cream-deep px-2.5 py-1 text-[13px] font-medium text-ink-soft">
              {selected.bin.pet_waste_status === 'allowed'
                ? '배변봉투 가능 (확인됨)'
                : '배변봉투 가능 여부 확인 안 됨'}
            </span>
          </div>

          <a
            href={kakaoDirectionsUrl(selected.bin)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-14 w-full items-center justify-center rounded-pill bg-sage text-[17px] font-bold text-paper shadow-button transition active:scale-[0.98] active:bg-sage-deep"
          >
            카카오맵으로 길찾기
          </a>

          {alternatives.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-[13px] font-semibold text-ink-soft">다른 후보</p>
              <ul className="divide-y divide-line">
                {alternatives.map((item) => (
                  <li key={item.bin.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item.bin)}
                      className="flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left"
                    >
                      <span className="truncate text-[15px] text-ink">{item.bin.detail_location}</span>
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
