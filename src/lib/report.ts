import type { Bin, LatLng, WasteKind } from '../types/bin.ts'
import { HANGDONG } from '../config/areas.ts'
import { supabase } from './supabase.ts'
import { shrinkPhoto } from './photo.ts'

export type NewBin = {
  position: LatLng
  photo: File
  wasteKind: WasteKind
  description: string
}

/* 사진 올리기 → 쓰레기통 등록. 등록하면 바로 다른 사람 지도에도 보인다 */
export async function submitBin(input: NewBin): Promise<Bin> {
  if (!supabase) throw new Error('서버가 아직 연결되지 않았어요')

  const photo = await shrinkPhoto(input.photo)
  const path = `reports/${crypto.randomUUID()}.jpg`
  const upload = await supabase.storage
    .from('bin-photos')
    .upload(path, photo, { contentType: 'image/jpeg', upsert: false })
  if (upload.error) throw new Error('사진을 올리지 못했어요')
  const photoUrl = supabase.storage.from('bin-photos').getPublicUrl(path).data.publicUrl

  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('bins')
    .insert({
      latitude: Number(input.position.lat.toFixed(6)),
      longitude: Number(input.position.lng.toFixed(6)),
      coord_source: 'gps_device',
      detail_location: input.description.trim() || '사용자가 등록한 쓰레기통',
      district: '구로구',
      area: HANGDONG.code,
      waste_kind: input.wasteKind,
      source: 'user_report',
      source_date: today,
      photo_url: photoUrl,
    })
    .select()
    .single()
  if (error) throw new Error('등록하지 못했어요. 서비스 지역 안인지 확인해 주세요')
  return data as Bin
}
