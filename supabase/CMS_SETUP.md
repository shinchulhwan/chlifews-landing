# CMS DB 설정 가이드

## 검증 결과 (로컬 `.env.local` → 원격 Supabase)

`npm run test:db-schema` 실행 시 **6개 CMS 테이블 모두 없음** (PGRST205):

| 테이블 | 상태 |
|--------|------|
| `site_settings` | ❌ 없음 |
| `project_overview` | ❌ 없음 |
| `project_premium` | ❌ 없음 |
| `project_location` | ❌ 없음 |
| `project_gallery` | ❌ 없음 |
| `project_floorplans` | ❌ 없음 |
| `project_community` | ❌ 없음 |

마이그레이션 SQL은 **로컬에만** 있고 Supabase에 **아직 적용되지 않았습니다.**  
(`customers` 등 기존 테이블은 별도 마이그레이션 001~007로 이미 존재)

---

## 마이그레이션 실행 순서

### 방법 A — 한 번에 실행 (권장)

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 → **SQL Editor**
2. `supabase/RUN_CMS_MIGRATIONS.sql` 내용 전체 붙여넣기 → **Run**
3. 로컬에서 검증:

```bash
npm run test:db-schema
```

### 방법 B — 파일별 순서 실행

| 순서 | 파일 |
|------|------|
| 1 | `supabase/migrations/008_site_settings.sql` |
| 2 | `supabase/migrations/009_project_content.sql` |
| 3 | `supabase/migrations/010_project_community.sql` |

### 방법 C — 단지 커뮤니티만 실행

`project_community` 테이블만 없을 때:

1. SQL Editor에서 `supabase/RUN_COMMUNITY_MIGRATION.sql` 실행

---

## 컬럼 구조 (코드 ↔ DB)

마이그레이션 적용 후 아래 구조와 `lib/types/database.ts` / `lib/types/project-content.ts` 가 일치합니다.

### site_settings
`key`, `value`, `updated_at`

### project_overview
`id`, `site_name`, `section_title`, `description`, `image_url`, `info_cards` (jsonb), `updated_at`

### project_premium
`id`, `site_name`, `record_kind` (`section` | `card`), `sort_order`, `title`, `description`, `image_url`, `created_at`, `updated_at`

### project_location
`id`, `site_name`, `section_title`, `main_image_url`, `points` (jsonb), `updated_at`

### project_gallery
`id`, `site_name`, `sort_order`, `image_url`, `title`, `is_featured`, `created_at`, `updated_at`

### project_floorplans
`id`, `site_name`, `sort_order`, `type_name`, `supply_area`, `exclusive_area`, `description`, `image_url`, `created_at`, `updated_at`

### project_community
`id`, `site_name`, `sort_order`, `title`, `subtitle`, `description`, `image_url`, `created_at`, `updated_at`

---

## 관리자 저장 API → 테이블 매핑

| API | operation | 테이블 | SQL |
|-----|-----------|--------|-----|
| `POST /api/admin/hero-background` | — | `site_settings` | UPSERT (`key=hero_background`) |
| `POST /api/admin/project-content` | `overview` | `project_overview` | UPSERT (`onConflict: site_name`) |
| | `premium-section` | `project_premium` | INSERT/UPDATE (`record_kind=section`) |
| | `premium-card` | `project_premium` | INSERT/UPDATE (`record_kind=card`) |
| | `premium-delete` | `project_premium` | DELETE |
| | `premium-reorder` | `project_premium` | UPDATE `sort_order` |
| | `location` | `project_location` | UPSERT (`onConflict: site_name`) |
| | `gallery-upload` | `project_gallery` | INSERT |
| | `gallery-delete` | `project_gallery` | DELETE |
| | `gallery-featured` | `project_gallery` | UPDATE `is_featured` |
| | `gallery-reorder` | `project_gallery` | UPDATE `sort_order` |
| | `floorplan` | `project_floorplans` | INSERT/UPDATE |
| | `floorplan-delete` | `project_floorplans` | DELETE |
| | `floorplan-reorder` | `project_floorplans` | UPDATE `sort_order` |
| | `community` | `project_community` | INSERT/UPDATE |
| | `community-delete` | `project_community` | DELETE |
| | `community-reorder` | `project_community` | UPDATE `sort_order` |

이미지 파일은 Supabase Storage `site-assets` 버킷에 저장되고, URL만 위 테이블에 기록됩니다.

---

## 저장 실패 원인

테이블 미생성 상태에서 저장 시 PostgREST 오류:

```
Could not find the table 'public.project_community' in the schema cache (PGRST205)
```

→ **`RUN_COMMUNITY_MIGRATION.sql`** 또는 **`RUN_CMS_MIGRATIONS.sql`** 실행 후 저장이 정상 동작합니다.

다른 CMS 테이블 오류 예:

```
Could not find the table 'public.project_overview' in the schema cache (PGRST205)
```

쓰기 권한: `SUPABASE_SERVICE_ROLE_KEY` (서버 전용). RLS는 SELECT만 anon/authenticated에 허용.

> **주의:** `npm run test:db-schema` 실행 시 이전 버전은 `project_overview` / `project_location`의 실제 `SITE_NAME` 데이터를 삭제할 수 있었습니다. 현재 스크립트는 `__db_schema_probe__` 전용 site_name만 사용합니다.
