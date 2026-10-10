import { useEffect, useMemo, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { HANGDONG } from '../config/areas.ts'
import { bins, usingMock } from '../data/bins.ts'
import { useMyLocation } from '../hooks/useMyLocation.ts'
import { go } from '../hooks/useHashRoute.ts'
import { directionLabel, distanceM } from '../lib/geo.ts'
import { recommend } from '../lib/recommend.ts'
import type { LatLng, PlacedBin } from '../types/bin.ts'
import { binIcon, meIcon } from '../components/map/markers.ts'
import RecommendSheet, { type SheetItem } from '../components/map/RecommendSheet.tsx'
import BackIcon from '../components/icons/BackIcon.tsx'
import LocateIcon from '../components/icons/LocateIcon.tsx'

/* 개발 중(npm run dev)에만: 지도를 눌러 테스트 위치 정하기 + 좌표 확인 */
const DEV_TOOLS = import.meta.env.DEV

/* 처음 열 때 서비스 지역 원 전체가 보이도록 */
const dLat = HANGDONG.radiusM / 111320
const dLng = HANGDONG.radiusM / (111320 * Math.cos((HANGDONG.center.lat * Math.PI) / 180))
const AREA_BOUNDS: [[number, number], [number, number]] = [
  [HANGDONG.center.lat - dLat, HANGDONG.center.lng - dLng],
  [HANGDONG.center.lat + dLat, HANGDONG.center.lng + dLng],
]

export default function MapPage() {
  const location = useMyLocation()
  const [testPosition, setTestPosition] = useState<LatLng | null>(null)
  const [picked, setPicked] = useState<LatLng | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  const me: LatLng | null =
    testPosition ?? (location.status === 'ok' ? location.position : null)

  const candidates = useMemo(() => (me ? recommend(me, bins) : []), [me])

  const toItem = (bin: PlacedBin): SheetItem => {
    const at = { lat: bin.latitude, lng: bin.longitude }
    return me
      ? { bin, distanceM: distanceM(me, at), direction: directionLabel(me, at) }
      : { bin, distanceM: null, direction: null }
  }

  const selectedBin =
    bins.find((b) => b.id === selectedId) ?? candidates[0]?.bin ?? null
  const selected = selectedBin ? toItem(selectedBin) : null
  const isTopPick = !!selectedBin && selectedBin.id === candidates[0]?.bin.id
  /* 추천 1위가 실제로도 가장 가까운 곳인지 (재활용 전용 등은 순위가 밀릴 수 있다) */
  const isClosest =
    isTopPick && candidates.every((c) => c.distanceM >= candidates[0].distanceM)
  const alternatives = candidates
    .filter((c) => c.bin.id !== selectedBin?.id)
    .slice(0, 2)
    .map((c) => toItem(c.bin))

  const outsideArea = !!me && distanceM(me, HANGDONG.center) > HANGDONG.radiusM

  const recenter = () => {
    if (me) mapRef.current?.flyTo([me.lat, me.lng], 17, { duration: 0.6 })
    else mapRef.current?.flyToBounds(AREA_BOUNDS, { padding: [12, 12], duration: 0.6 })
  }

  return (
    <div className="flex h-dvh justify-center bg-cream">
      <div className="flex h-full w-full max-w-[430px] flex-col">
        <div className="relative min-h-0 flex-1">
          <MapContainer
            ref={mapRef}
            bounds={AREA_BOUNDS}
            boundsOptions={{ padding: [12, 12] }}
            zoomControl={false}
            zoomSnap={0.25}
            className="absolute inset-0 z-0 bg-cream-deep"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            {/* 서비스 지역: 푸른수목원 중심 1.5km */}
            <Circle
              center={[HANGDONG.center.lat, HANGDONG.center.lng]}
              radius={HANGDONG.radiusM}
              pathOptions={{
                color: '#657A4E',
                weight: 2.5,
                dashArray: '8 10',
                fillColor: '#DDE5C9',
                fillOpacity: 0.16,
              }}
              interactive={false}
            />

            {bins.map((bin) => (
              <Marker
                key={bin.id}
                position={[bin.latitude, bin.longitude]}
                icon={binIcon(bin, bin.id === selectedBin?.id, usingMock)}
                zIndexOffset={bin.id === selectedBin?.id ? 1000 : 0}
                eventHandlers={{ click: () => setSelectedId(bin.id) }}
              />
            ))}

            {location.status === 'ok' && !testPosition && (
              <Circle
                center={[location.position.lat, location.position.lng]}
                radius={location.accuracyM}
                pathOptions={{ stroke: false, fillColor: '#D9824B', fillOpacity: 0.1 }}
                interactive={false}
              />
            )}
            {me && <Marker position={[me.lat, me.lng]} icon={meIcon} interactive={false} />}

            <FitAreaOnOpen />
            <FollowFirstFix me={me} />

            {DEV_TOOLS && (
              <>
                <PickOnClick onPick={setPicked} />
                {picked && (
                  <Popup position={[picked.lat, picked.lng]} eventHandlers={{ remove: () => setPicked(null) }}>
                    <CoordPopup
                      at={picked}
                      onUseAsMe={() => {
                        setTestPosition(picked)
                        setSelectedId(null)
                        setPicked(null)
                      }}
                    />
                  </Popup>
                )}
              </>
            )}
          </MapContainer>

          {/* 상단: 뒤로가기 + 지역 표시 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),14px)]">
            <button
              type="button"
              onClick={() => go('home')}
              aria-label="처음 화면으로"
              className="pointer-events-auto flex size-12 items-center justify-center rounded-pill bg-paper text-ink shadow-soft active:scale-95"
            >
              <BackIcon className="size-6" />
            </button>
            <span className="rounded-pill bg-paper px-4 py-2.5 font-display text-[16px] leading-none text-ink shadow-soft">
              {HANGDONG.name}
            </span>
            {usingMock && (
              <span className="rounded-pill bg-ink px-3 py-2 text-[12px] font-bold text-paper">MOCK 데이터</span>
            )}
          </div>

          {/* 내 위치로 */}
          <div className="absolute right-4 bottom-4 z-10 flex flex-col items-end gap-2">
            {testPosition && (
              <button
                type="button"
                onClick={() => {
                  setTestPosition(null)
                  setSelectedId(null)
                }}
                className="rounded-pill bg-paper px-3 py-2 text-[13px] font-medium text-ink-soft shadow-soft"
              >
                테스트 위치 해제
              </button>
            )}
            <button
              type="button"
              onClick={recenter}
              aria-label="내 위치로 이동"
              className="flex size-12 items-center justify-center rounded-pill bg-paper text-sage shadow-soft active:scale-95"
            >
              <LocateIcon className="size-6" />
            </button>
          </div>
        </div>

        <RecommendSheet
          location={location}
          selected={selected}
          label={isClosest ? '가장 가까운 쓰레기통' : isTopPick ? '추천 쓰레기통' : '선택한 쓰레기통'}
          alternatives={alternatives}
          outsideArea={outsideArea}
          canPickTestLocation={DEV_TOOLS}
          onSelect={(bin) => {
            setSelectedId(bin.id)
            mapRef.current?.panTo([bin.latitude, bin.longitude])
          }}
        />
      </div>
    </div>
  )
}

/* 레이아웃이 잡힌 뒤 크기를 다시 재고 서비스 지역 전체가 보이게 맞춘다 */
function FitAreaOnOpen() {
  const map = useMap()
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      map.invalidateSize()
      map.fitBounds(AREA_BOUNDS, { padding: [12, 12] })
    })
    return () => cancelAnimationFrame(id)
  }, [map])
  return null
}

/* 처음 위치를 찾았을 때 한 번만 내 위치로 지도를 옮긴다 (서비스 지역 근처일 때만) */
function FollowFirstFix({ me }: { me: LatLng | null }) {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (!me || done.current) return
    done.current = true
    if (distanceM(me, HANGDONG.center) < HANGDONG.radiusM * 2) map.setView([me.lat, me.lng], 16)
  }, [me, map])
  return null
}

function PickOnClick({ onPick }: { onPick: (at: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

function CoordPopup({ at, onUseAsMe }: { at: LatLng; onUseAsMe: () => void }) {
  const text = `${at.lat.toFixed(6)}, ${at.lng.toFixed(6)}`
  const [copied, setCopied] = useState(false)
  return (
    <div className="w-[200px] font-sans">
      <p className="text-[12px] font-semibold text-ink-soft">이 지점 좌표</p>
      <p className="mt-0.5 text-[14px] font-bold text-ink select-all">{text}</p>
      <div className="mt-2.5 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onUseAsMe}
          className="h-10 rounded-pill bg-sage text-[14px] font-bold text-paper"
        >
          여기를 내 위치로 (테스트)
        </button>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              ?.writeText(text)
              .then(() => setCopied(true))
              .catch(() => {})
          }}
          className="h-10 rounded-pill bg-cream-deep text-[14px] font-bold text-ink"
        >
          {copied ? '복사했어요' : '좌표 복사'}
        </button>
      </div>
    </div>
  )
}
