import type { Bin, PlacedBin } from '../types/bin.ts'
import realBins from '../../data/bins/hangdong.json'
import mock from '../../data/mock/bins.mock.json'

const isPlaced = (bin: Bin): bin is PlacedBin =>
  bin.coord_source !== 'failed' && bin.latitude !== null && bin.longitude !== null

const real = (realBins as Bin[]).filter(isPlaced)

/*
 * 실제 데이터(data/bins/hangdong.json)가 있으면 그것만 쓴다.
 * 아직 한 곳도 없을 때만 화면 확인용 mock을 보여주고, 화면에 MOCK이라고 표시한다.
 */
export const usingMock = real.length === 0
export const bins: PlacedBin[] = usingMock ? (mock.bins as Bin[]).filter(isPlaced) : real
