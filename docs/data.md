# 데이터 구조와 수집 원칙

이 문서는 쓰레개똥이 다루는 데이터의 **형식**과 **지켜야 할 원칙**을 정의한다.
기계가 검증할 수 있는 형식은 `data/schema/bin.schema.json`에 있다.

---

## 1. 핵심 원칙

1. **`pet_waste_status` 기본값은 `unknown`.** 근거(현장 안내문 등)를 직접 확인하기 전에는 절대 바꾸지 않는다.
2. **일반 쓰레기통 ≠ 배변봉투 투기 가능.** 종류만 보고 `allowed`로 판단하지 않는다.
3. **반려견 배변봉투함 ≠ 배변봉투 수거함.** 봉투를 나눠주는 지급함일 수 있으므로 이름만 보고 판단하지 않는다.
4. **공용 공간만 등록.** 아파트 단지 내부, 상가 내부, 사유지는 제외.
5. **담배꽁초 전용 수거함은 제외.**
6. **모든 데이터는 출처를 추적할 수 있어야 한다.** (`source`, `source_ref`, `source_date`, `coord_source`)
7. **mock 데이터는 실제처럼 보이지 않게.** `source: "mock"`, 설명에 `[MOCK]`.
8. **제보는 `bins`를 자동으로 바꾸지 않는다.** 운영자가 확인 후 반영한다.

---

## 2. `bins` — 쓰레기통 (장소 1곳 = 1행)

같은 위치에 일반통과 재활용통이 함께 있으면 **하나의 장소로 합쳐** `waste_kind = general_and_recycle`로 기록한다.

| 필드 | 타입 | 필수 | 설명 | 초기값 / 예시 |
|---|---|---|---|---|
| `id` | string (uuid) | ✅ | 고유 ID | 자동 생성 |
| `latitude` | number \| null | ✅ | 위도 (WGS84) | `37.49...` · 좌표 확보 실패 시 `null` |
| `longitude` | number \| null | ✅ | 경도 (WGS84) | `126.82...` · 실패 시 `null` |
| `coord_source` | enum | ✅ | 좌표를 얻은 방법 | 아래 표 참고 |
| `address` | string \| null | | 주소 (도로명 또는 지번) | 없으면 `null` |
| `detail_location` | string | ✅ | 사람이 읽는 위치 설명 ← **화면 핵심 정보** | `"항동철길 입구 벤치 옆"` |
| `district` | string | ✅ | 행정구역 (시군구) | `"구로구"`, `"부천시"` |
| `area` | string | ✅ | 서비스 생활권 코드 | `"hangdong"` |
| `place_type` | enum | ✅ | 설치 장소 유형 | 아래 표 참고 |
| `bin_type` | enum | ✅ | 쓰레기통 종류 | 아래 표 참고 |
| `waste_kind` | enum | ✅ | 수거 쓰레기 종류 | 아래 표 참고 |
| `pet_waste_status` | enum | ✅ | 반려견 배변봉투 투기 가능 여부 | **`unknown`** |
| `bag_available` | enum | ✅ | 배변봉투 비치 여부 | **`unknown`** |
| `source` | enum | ✅ | 데이터 출처 | 아래 표 참고 |
| `source_ref` | string \| null | | 원본 추적값 | `"SURVEY-2026-001"`, 공공데이터 `연번` |
| `source_date` | string (date) \| null | | 원본 데이터 기준일 | `"2026-10-12"` |
| `status` | enum | ✅ | 운영 상태 | `active` |
| `last_verified_at` | string (datetime) \| null | | 마지막 현장 확인 시각 | 확인 전 `null` |
| `photo_url` | string \| null | | 대표 사진 (위치정보 제거본) | 없으면 `null` |
| `note` | string \| null | | 메모 | `"저녁엔 자주 꽉 참"` |
| `created_at` | string (datetime) | ✅ | 생성 시각 | 자동 |
| `updated_at` | string (datetime) | ✅ | 수정 시각 | 자동 |

> `area`, `photo_url`, `note`, `created_at`, `updated_at`은 요청된 최소 필드 외에 운영상 필요해 추가한 필드다.

### 2-1. 상태값 정의

**`pet_waste_status`** — 반려견 배변봉투를 버려도 되는가

| 값 | 의미 | 바꿀 수 있는 근거 |
|---|---|---|
| `unknown` | 확인되지 않음 (**기본값**) | — |
| `allowed` | 가능하다는 근거가 확인됨 | 현장 안내문 사진, 관리기관 공식 안내, 운영자 현장 확인 (`note`·`last_verified_at` 기록) |
| `not_allowed` | 금지 근거가 확인됨 | 현장 "투기 금지" 안내문 사진, 공식 안내 |

**`bag_available`** — 배변봉투가 비치되어 있는가: `yes` / `no` / `unknown`(기본값)

**`bin_type`**

| 값 | 의미 |
|---|---|
| `street_bin` | 길거리(가로) 쓰레기통 |
| `park_bin` | 공원·수목원·산책로 쓰레기통 |
| `pet_bag_box` | 반려견 배변봉투함 (수거함인지 지급함인지 확인 필요) |
| `other` | 기타 |

**`waste_kind`**

| 값 | 의미 | 추천 우선순위 |
|---|---|---|
| `general_and_recycle` | 일반 + 재활용 | 높음 |
| `general` | 일반쓰레기 | 높음 |
| `recycle` | 재활용만 | 낮음 |
| `unknown` | 확인 안 됨 | 중간 |

※ 우선순위는 쓰레기 종류에 따른 **후보 순서**일 뿐, 배변물 투기 허용을 의미하지 않는다.

**`place_type`**: `walking_trail`(산책로·철길) / `park`(공원·수목원) / `street`(도로변·횡단보도) / `bus_stop`(정류장) / `subway`(지하철역) / `commercial`(상가 거리) / `other`

**`coord_source`**

| 값 | 의미 |
|---|---|
| `gps_photo` | 현장 사진의 GPS 정보에서 추출 |
| `gps_device` | 현장에서 기기 위치로 직접 기록 |
| `manual_pin` | 지도에서 사람이 핀을 옮겨 보정 |
| `source_data` | 원본 데이터에 좌표가 포함됨 (예: 중구 배변봉투함 CSV) |
| `geocoded` | 주소를 지오코더로 변환 (저장 허용이 공식 확인된 서비스만) |
| `failed` | 좌표 확보 실패 → **지도에 표시하지 않음**, 나중에 보정 |
| `mock` | 가짜 데이터용 임의 좌표 |

**`source`**: `field_survey`(직접 현장조사) / `user_report`(사용자 제보 반영) / `public_data`(공공데이터) / `mock`(UI 개발용 가짜)

**`status`**

| 값 | 의미 | 지도 표시 |
|---|---|---|
| `active` | 운영 중 | 표시 |
| `missing` | 없어진 것으로 확인 | 숨김 |
| `hidden` | 검토 중 등으로 임시 숨김 | 숨김 |

---

## 3. `reports` — 사용자 제보 (Step 6에서 구현 예정)

| 필드 | 설명 |
|---|---|
| `id` | uuid |
| `bin_id` | 대상 쓰레기통 (새 쓰레기통 제보면 `null`) |
| `report_type` | `missing` / `wrong_location` / `new_bin` / `pet_allowed` / `pet_not_allowed` / `other` |
| `latitude`, `longitude` | 제보 위치 (새 쓰레기통·위치 수정 시) |
| `message` | 자유 메모 (선택) |
| `client_id` | 브라우저별 무작위 ID (중복 제보 확인용, 개인정보 아님) |
| `review_status` | `pending` / `accepted` / `rejected` |
| `created_at` | 제보 시각 |

**운영 흐름:** 제보 → `pending` → 운영자 확인 → `bins` 수동 반영 + `last_verified_at` 갱신 → `accepted`

---

## 4. 좌표 확보 원칙

| 방법 | 사용 여부 | 이유 |
|---|---|---|
| 현장 사진 GPS / 기기 GPS | ✅ 사용 | 직접 수집한 데이터 |
| 지도에서 수동 핀 보정 | ✅ 사용 | GPS 오차 보정 |
| 카카오 로컬 API(주소→좌표) 결과 저장 | ❌ 금지 | 카카오 운영정책·공식 답변상 좌표 저장 불가 |
| 브이월드 지오코더 결과 저장 | ❌ 사용 안 함 | 공식 안내상 실시간 사용, DB 저장 불가 |
| SGIS 지오코딩 결과 저장 | ⏸ 보류 | 약관상 명시적 허용·금지 조항 없음 → 공식 문의 중 |

카카오맵 JavaScript SDK는 **지도 표시와 길찾기 연결**에만 사용한다.

---

## 5. 데이터 출처별 계획

| 출처 | 시기 | 비고 |
|---|---|---|
| mock 데이터 (`data/mock/`) | 현재 ~ UI 개발 | 실제 위치 아님 |
| 직접 현장조사 | MVP 테스트 전 | 10~30곳, `docs/field-survey.md` |
| 사용자 제보 | MVP 테스트 이후 | 운영자 검토 후 반영 |
| 서울시 가로쓰레기통 설치정보 (2025.11) | 구로구 확장 시 | 좌표 없음 → 지오코더 확정 후. 담배꽁초 전용 제외, 장소 단위 통합 |
| 중구 반려동물 배변봉투함 (2026.07) | 서울 확장 시 | 좌표 포함, 12곳, `pet_bag_box` / `unknown` |
