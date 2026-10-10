-- 쓰레개똥 Supabase 설정
-- Supabase 대시보드 → SQL Editor → New query 에 이 파일 전체를 붙여넣고 Run.
-- 여러 번 실행해도 안전하다.

-- 1. 쓰레기통 표 (data/schema/bin.schema.json과 같은 형식)
create table if not exists public.bins (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  coord_source text not null
    check (coord_source in ('gps_photo', 'gps_device', 'manual_pin', 'source_data', 'geocoded')),
  address text,
  detail_location text not null check (char_length(detail_location) between 1 and 100),
  district text not null default '구로구',
  area text not null default 'hangdong',
  place_type text not null default 'other'
    check (place_type in ('walking_trail', 'park', 'street', 'bus_stop', 'subway', 'commercial', 'other')),
  bin_type text not null default 'other'
    check (bin_type in ('street_bin', 'park_bin', 'pet_bag_box', 'other')),
  waste_kind text not null default 'unknown'
    check (waste_kind in ('general_and_recycle', 'general', 'recycle', 'unknown')),
  pet_waste_status text not null default 'unknown'
    check (pet_waste_status in ('allowed', 'not_allowed', 'unknown')),
  bag_available text not null default 'unknown'
    check (bag_available in ('yes', 'no', 'unknown')),
  source text not null default 'user_report'
    check (source in ('field_survey', 'user_report', 'public_data')),
  source_ref text,
  source_date date,
  status text not null default 'active' check (status in ('active', 'missing', 'hidden')),
  last_verified_at timestamptz,
  photo_url text,
  note text check (note is null or char_length(note) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bins enable row level security;

-- 등록한 사람만 삭제할 수 있게: 등록한 휴대폰이 가진 비밀 열쇠의 SHA-256 값 (열쇠 자체는 저장하지 않음)
alter table public.bins add column if not exists owner_token_hash text
  check (owner_token_hash is null or owner_token_hash ~ '^[0-9a-f]{64}$');

-- 2. 누가 무엇을 할 수 있는가 (RLS)
-- 읽기: 누구나, 운영 중(active)인 것만
drop policy if exists "누구나 운영 중인 쓰레기통 보기" on public.bins;
create policy "누구나 운영 중인 쓰레기통 보기"
  on public.bins for select
  to anon, authenticated
  using (status = 'active');

-- 등록: 누구나, 단 아래 조건을 지킬 때만 (등록하면 바로 지도에 보임 — 2026-10-10 결정)
--  - 사용자 등록 표시, 휴대폰 GPS 좌표
--  - 배변봉투 가능 여부·봉투 비치는 '확인 안 됨'으로만 (운영자만 바꿀 수 있음)
--  - 항동 생활권 근처 좌표만 (푸른수목원 중심 약 2km 네모)
--  - 사진은 이 프로젝트의 bin-photos 저장소 주소만
-- 수정 정책은 만들지 않는다 → 사용자는 수정 불가. 삭제는 아래 delete_my_bin 함수로 본인 것만.
drop policy if exists "누구나 쓰레기통 등록" on public.bins;
create policy "누구나 쓰레기통 등록"
  on public.bins for insert
  to anon, authenticated
  with check (
    source = 'user_report'
    and status = 'active'
    and coord_source = 'gps_device'
    and pet_waste_status = 'unknown'
    and bag_available = 'unknown'
    and last_verified_at is null
    and area = 'hangdong'
    and latitude between 37.466 and 37.502
    and longitude between 126.802 and 126.847
    and photo_url like '%/storage/v1/object/public/bin-photos/reports/%'
  );

-- 삭제: 등록한 사람만 (휴대폰에 저장된 열쇠가 맞을 때만). 다른 사람·운영자 데이터는 삭제 불가.
-- 표에 직접 지우는 권한은 주지 않고, 열쇠를 확인하는 이 함수로만 지울 수 있다.
create extension if not exists pgcrypto with schema extensions;

create or replace function public.delete_my_bin(p_id uuid, p_token text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  deleted int;
begin
  delete from public.bins
  where id = p_id
    and source = 'user_report'
    and owner_token_hash is not null
    and owner_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
  get diagnostics deleted = row_count;
  return deleted > 0;
end;
$$;

revoke all on function public.delete_my_bin(uuid, text) from public;
grant execute on function public.delete_my_bin(uuid, text) to anon, authenticated;

-- 3. 사진 저장소: 누구나 볼 수 있고, 누구나 올릴 수 있음 (덮어쓰기·삭제는 불가)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bin-photos', 'bin-photos', true, 2097152, array['image/jpeg'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

drop policy if exists "누구나 쓰레기통 사진 올리기" on storage.objects;
create policy "누구나 쓰레기통 사진 올리기"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'bin-photos' and (storage.foldername(name))[1] = 'reports');
