/* data/schema/bin.schema.json과 같은 형식. 설명은 docs/data.md 참고 */
export type PetWasteStatus = 'allowed' | 'not_allowed' | 'unknown'
export type WasteKind = 'general_and_recycle' | 'general' | 'recycle' | 'unknown'

export type Bin = {
  id: string
  latitude: number | null
  longitude: number | null
  coord_source: 'gps_photo' | 'gps_device' | 'manual_pin' | 'source_data' | 'geocoded' | 'failed' | 'mock'
  address?: string | null
  detail_location: string
  district: string
  area: string
  place_type: 'walking_trail' | 'park' | 'street' | 'bus_stop' | 'subway' | 'commercial' | 'other'
  bin_type: 'street_bin' | 'park_bin' | 'pet_bag_box' | 'other'
  waste_kind: WasteKind
  pet_waste_status: PetWasteStatus
  bag_available: 'yes' | 'no' | 'unknown'
  source: 'field_survey' | 'user_report' | 'public_data' | 'mock'
  source_ref?: string | null
  source_date?: string | null
  status: 'active' | 'missing' | 'hidden'
  last_verified_at?: string | null
  photo_url?: string | null
  owner_token_hash?: string | null
  note?: string | null
}

/* 지도에 그릴 수 있는(좌표가 있는) 쓰레기통 */
export type PlacedBin = Bin & { latitude: number; longitude: number }

export type LatLng = { lat: number; lng: number }
