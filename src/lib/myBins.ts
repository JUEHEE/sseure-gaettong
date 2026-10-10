/*
 * 내가 등록한 쓰레기통 = 이 휴대폰(브라우저)에 저장된 비밀 열쇠로 구분한다. (회원가입 없음)
 * 서버에는 열쇠를 SHA-256으로 바꾼 값만 보내고, 삭제할 때 열쇠를 보내 서버가 맞는지 확인한다.
 * 브라우저를 바꾸거나 데이터를 지우면 열쇠도 사라져서 직접 삭제는 못 한다 (운영자는 가능).
 */
const KEY = 'sseure-my-bins'

type Mine = Record<string, string> // bin id → 열쇠

function read(): Mine {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Mine
  } catch {
    return {}
  }
}

function write(mine: Mine) {
  try {
    localStorage.setItem(KEY, JSON.stringify(mine))
  } catch {
    /* 저장 못 하면 직접 삭제만 못 할 뿐 등록은 된다 */
  }
}

export function newOwnerToken(): string {
  return crypto.randomUUID()
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function rememberMine(binId: string, token: string) {
  write({ ...read(), [binId]: token })
}

export function myToken(binId: string): string | null {
  return read()[binId] ?? null
}

export function forgetMine(binId: string) {
  const mine = read()
  delete mine[binId]
  write(mine)
}
