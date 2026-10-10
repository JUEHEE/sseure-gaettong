import type { Bin, LatLng, WasteKind } from '../types/bin.ts'
import { HANGDONG } from '../config/areas.ts'
import { supabase } from './supabase.ts'
import { shrinkPhoto } from './photo.ts'
import { forgetMine, myToken, newOwnerToken, rememberMine, sha256Hex } from './myBins.ts'

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
  const ownerToken = newOwnerToken()
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
      owner_token_hash: await sha256Hex(ownerToken),
    })
    .select()
    .single()
  if (error) throw new Error('등록하지 못했어요. 서비스 지역 안인지 확인해 주세요')
  const bin = data as Bin
  rememberMine(bin.id, ownerToken)
  return bin
}

/* 내가 등록한 쓰레기통 삭제. 이 휴대폰에 열쇠가 있을 때만 가능하고, 서버가 열쇠를 다시 확인한다 */
export async function deleteMyBin(binId: string): Promise<void> {
  if (!supabase) throw new Error('서버가 아직 연결되지 않았어요')
  const token = myToken(binId)
  if (!token) throw new Error('이 휴대폰에서 등록한 쓰레기통만 삭제할 수 있어요')
  const { data, error } = await supabase.rpc('delete_my_bin', { p_id: binId, p_token: token })
  if (error || data !== true) throw new Error('삭제하지 못했어요. 잠시 뒤 다시 해 주세요')
  forgetMine(binId)
}
