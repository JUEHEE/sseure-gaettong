import type { Bin, PlacedBin } from '../types/bin.ts'
import realBins from '../../data/bins/hangdong.json'

const isPlaced = (bin: Bin): bin is PlacedBin =>
  bin.coord_source !== 'failed' && bin.latitude !== null && bin.longitude !== null

/* 실제 데이터만 쓴다 (mock은 화면에 넣지 않음) */
export const bins: PlacedBin[] = (realBins as Bin[]).filter(isPlaced)
