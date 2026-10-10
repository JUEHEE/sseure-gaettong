import { useCallback, useEffect, useState } from 'react'
import type { Bin, PlacedBin } from '../types/bin.ts'
import { bins as staticBins } from '../data/bins.ts'
import { supabase } from '../lib/supabase.ts'

const isPlaced = (bin: Bin): bin is PlacedBin =>
  bin.coord_source !== 'failed' && bin.latitude !== null && bin.longitude !== null

/*
 * 쓰레기통 = 저장소에 있는 운영자 데이터(data/bins) + 서버에 쌓이는 사용자 등록
 * 서버가 연결되지 않았거나 실패하면 운영자 데이터만 보여준다.
 */
export function useBins() {
  const [remote, setRemote] = useState<PlacedBin[]>([])

  const refresh = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('bins').select('*').eq('status', 'active')
    if (!error && data) setRemote((data as Bin[]).filter(isPlaced))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = useCallback((bin: Bin) => {
    if (isPlaced(bin)) setRemote((prev) => [...prev, bin])
  }, [])

  const remove = useCallback((id: string) => {
    setRemote((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return { bins: [...staticBins, ...remote], refresh, add, remove, canReport: supabase !== null }
}
