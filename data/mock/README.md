# ⚠️ Mock 데이터

이 폴더의 데이터는 **UI 개발용 가짜 데이터**입니다.

- 실제 쓰레기통 위치가 **아닙니다.** 좌표는 항동 일대에 임의로 배치했습니다.
- 모든 항목은 `source: "mock"`, `coord_source: "mock"`, 설명에 `[MOCK]`이 붙어 있습니다.
- 실제 데이터(현장조사)가 들어오면 이 데이터는 앱에서 제거합니다.

## 포함된 UI 상태

| id | 확인할 UI 상태 |
|---|---|
| mock-001 | 일반+재활용, `unknown` (가장 흔한 경우) |
| mock-002 | 일반만, `unknown` |
| mock-003 | 재활용만 → 낮은 추천 순위 |
| mock-004 | 배변봉투함(`pet_bag_box`), `unknown` → 별도 마커 |
| mock-005 | `allowed` 뱃지 |
| mock-006 | `not_allowed` → 추천 제외, 금지 표시 |
| mock-007 | `status: missing` → 지도에 숨김 |
| mock-008 | `coord_source: failed` → 지도에 숨김 |

형식은 `../schema/bin.schema.json`을 따릅니다.
