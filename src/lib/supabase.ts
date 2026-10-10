import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/* .env에 값이 없으면 null → 서버 없이도 앱은 정적 데이터로 동작한다 */
export const supabase = url && key ? createClient(url, key) : null
