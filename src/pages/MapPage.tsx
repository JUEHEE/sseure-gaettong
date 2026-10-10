import { useEffect, useMemo, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { HANGDONG } from '../config/areas.ts'
import { useBins } from '../hooks/useBins.ts'
import { useMyLocation } from '../hooks/useMyLocation.ts'
import { go } from '../hooks/useRoute.ts'
import { directionLabel, distanceM } from '../lib/geo.ts'
import { recommend } from '../lib/recommend.ts'
import { groupPlaces, type Place } from '../lib/places.ts'
import type { LatLng } from '../types/bin.ts'
import { meIcon, placeIcon } from '../components/map/markers.ts'
import RecommendSheet, { type SheetItem } from '../components/map/RecommendSheet.tsx'
import ReportSheet from '../components/map/ReportSheet.tsx'
import { loadDraft } from '../lib/draft.ts'
import { myToken } from '../lib/myBins.ts'
import { deleteMyBin } from '../lib/report.ts'
import { ChevronLeft, LocationArrow } from '../components/icons/Symbols.tsx'
import { BinSticker } from '../components/icons/Stickers.tsx'

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
  const [satellite, setSatellite] = useState(false)
  /* 카메라를 다녀오다 페이지가 다시 열린 경우, 쓰던 등록 화면을 다시 연다 */
  const [restoredDraft, setRestoredDraft] = useState(loadDraft)
  const [reporting, setReporting] = useState(restoredDraft !== null)
  const [notice, setNotice] = useState<string | null>(null)
  const [sheetCollapsed, setSheetCollapsed] = useState(false)
  const { bins, add, remove, canReport } = useBins()
  const places = useMemo(() => groupPlaces(bins), [bins])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  const me: LatLng | null =
    testPosition ?? (location.status === 'ok' ? location.position : null)

  const candidates = useMemo(() => (me ? recommend(me, places) : []), [me, places])

  const toItem = (place: Place): SheetItem =>
    me
      ? { place, distanceM: distanceM(me, place), direction: directionLabel(me, place) }
      : { place, distanceM: null, direction: null }

  const selectedPlace =
    places.find((p) => p.key === selectedId) ?? candidates[0]?.place ?? null
  const selected = selectedPlace ? toItem(selectedPlace) : null
  const isTopPick = !!selectedPlace && selectedPlace.key === candidates[0]?.place.key
  /* 추천 1위가 실제로도 가장 가까운 곳인지 (재활용 전용 등은 순위가 밀릴 수 있다) */
  const isClosest =
    isTopPick && candidates.every((c) => c.distanceM >= candidates[0].distanceM)
  const alternatives = candidates
    .filter((c) => c.place.key !== selectedPlace?.key)
    .slice(0, 2)
    .map((c) => toItem(c.place))

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
            maxZoom={20}
            className={`absolute inset-0 z-0 bg-cream-deep ${satellite ? 'satellite' : ''}`}
          >
            {satellite ? (
              /* 개발용: 단지 안 같은 곳의 위치를 찍을 때 건물을 보려고 쓰는 위성사진 */
              <TileLayer
                key="satellite"
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={19}
                maxZoom={20}
              />
            ) : (
              <TileLayer
                key="osm"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxNativeZoom={19}
                maxZoom={20}
              />
            )}

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

            {places.map((place) => (
              <Marker
                key={place.key}
                position={[place.lat, place.lng]}
                icon={placeIcon(place, place.key === selectedPlace?.key)}
                zIndexOffset={place.key === selectedPlace?.key ? 1000 : 0}
                eventHandlers={{
                  click: () => {
                    setSelectedId(place.key)
                    setSheetCollapsed(false)
                  },
                }}
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
            <ResizeWithContainer />
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
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),12px)]">
            <button
              type="button"
              onClick={() => go('home')}
              aria-label="처음 화면으로"
              className="glass pointer-events-auto flex size-11 items-center justify-center rounded-pill text-ink transition active:scale-95"
            >
              <ChevronLeft className="size-[22px] -translate-x-px" />
            </button>
            <span className="glass flex h-11 items-center rounded-pill px-4 text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {HANGDONG.name}
            </span>
            {DEV_TOOLS && (
              <button
                type="button"
                onClick={() => setSatellite((v) => !v)}
                className="glass pointer-events-auto ml-auto flex h-11 items-center rounded-pill px-4 text-[15px] font-semibold text-ink"
              >
                {satellite ? '지도' : '위성'}
              </button>
            )}
          </div>

          {/* 쓰레기통 등록 */}
          {canReport && (
            <button
              type="button"
              onClick={() => setReporting(true)}
              className="glass absolute bottom-4 left-4 z-10 flex h-11 items-center gap-1.5 rounded-pill pr-4 pl-3.5 text-[15px] font-semibold tracking-[-0.01em] text-ink transition active:scale-95"
            >
              <BinSticker className="-my-1 size-[26px] [&>svg]:size-full" />
              쓰레기통 등록
            </button>
          )}

          {notice && (
            <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center">
              <span role="status" className="rounded-pill bg-ink/85 px-4 py-2.5 text-[14px] font-semibold text-paper shadow-float backdrop-blur-md">
                {notice}
              </span>
            </div>
          )}

          {/* 내 위치로 */}
          <div className="absolute right-4 bottom-4 z-10 flex flex-col items-end gap-2">
            {testPosition && (
              <button
                type="button"
                onClick={() => {
                  setTestPosition(null)
                  setSelectedId(null)
                }}
                className="glass h-9 rounded-pill px-3 text-[13px] font-semibold text-label-2"
              >
                테스트 위치 해제
              </button>
            )}
            <button
              type="button"
              onClick={recenter}
              aria-label="내 위치로 이동"
              className="glass flex size-11 items-center justify-center rounded-pill text-sage transition active:scale-95"
            >
              <LocationArrow className="size-5" />
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
          collapsed={sheetCollapsed}
          onCollapsedChange={setSheetCollapsed}
          isMine={(id) => myToken(id) !== null}
          onDelete={async (id) => {
            await deleteMyBin(id)
            remove(id)
            setSelectedId(null)
            setNotice('삭제했어요')
            setTimeout(() => setNotice(null), 2500)
          }}
          onSelect={(place) => {
            setSelectedId(place.key)
            mapRef.current?.panTo([place.lat, place.lng])
          }}
        />

        {reporting && (
          <ReportSheet
            me={me}
            restored={restoredDraft}
            accuracyM={location.status === 'ok' && !testPosition ? location.accuracyM : null}
            onClose={() => {
              setReporting(false)
              setRestoredDraft(null)
            }}
            onDone={(bin) => {
              add(bin)
              setReporting(false)
              setRestoredDraft(null)
              setSelectedId(`${bin.latitude!.toFixed(6)},${bin.longitude!.toFixed(6)}`)
              setNotice('등록했어요! 다른 사람 지도에도 보여요')
              setTimeout(() => setNotice(null), 2500)
            }}
          />
        )}
      </div>
    </div>
  )
}

/* 아래 카드를 접고 펼치면 지도 영역 크기가 바뀌므로 지도에 다시 알려준다 */
function ResizeWithContainer() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
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
          className="h-10 rounded-xl bg-sage text-[14px] font-semibold text-paper"
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
          className="h-10 rounded-xl bg-fill text-[14px] font-semibold text-ink"
        >
          {copied ? '복사했어요' : '좌표 복사'}
        </button>
      </div>
    </div>
  )
}
