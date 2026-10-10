import type { WasteKind } from '../types/bin.ts'

/*
 * 등록 중이던 내용을 잠깐 기억한다.
 * 휴대폰이 카메라를 여는 동안 브라우저 페이지를 꺼버려도, 돌아오면 등록 화면을 다시 열기 위해서.
 * (사진 파일 자체는 저장할 수 없어서 다시 골라야 한다)
 */
export type Draft = { kind: WasteKind; description: string; at: number }

const KEY = 'sseure-report-draft'
const FRESH_MS = 15 * 60 * 1000

export function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const draft = JSON.parse(raw) as Draft
    return Date.now() - draft.at < FRESH_MS ? draft : null
  } catch {
    return null
  }
}

export function saveDraft(kind: WasteKind, description: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ kind, description, at: Date.now() }))
  } catch {
    /* 저장 못 해도 등록 자체는 된다 */
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* 무시 */
  }
}
