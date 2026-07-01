# Supabase Storage — site-assets 버킷 설정

Hero 배경 및 섹션 콘텐츠 이미지는 `site-assets` 버킷에 저장됩니다.

## 1. Supabase Dashboard에서 버킷 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **Storage** → **New bucket**
3. 설정:
   - **Name**: `site-assets`
   - **Public bucket**: ✅ 켜기 (공개 URL로 랜딩에 표시)

## 2. SQL Editor에서 정책 적용 (선택)

Dashboard에서 public 버킷을 만들면 읽기 정책이 자동 적용됩니다.  
아래 SQL은 수동 설정 시 참고용입니다.

```sql
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "site_assets_public_read" on storage.objects;

create policy "site_assets_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'site-assets');
```

## 3. 업로드 권한

관리자 업로드는 **서버의 `SUPABASE_SERVICE_ROLE_KEY`** 로 수행합니다.  
`.env.local`에 service role 키가 설정되어 있어야 합니다.

## 4. 저장 경로 예시

경로는 **영문 slug**만 사용합니다 (`a-z`, `0-9`, `-`, `/`).

`.env.local`에 slug 지정 (권장):

```
SITE_STORAGE_SLUG=dongam-truel
```

| 항목 | 경로 |
|------|------|
| Hero 배경 | `projects/{slug}/hero/hero-bg.{ext}` |
| 사업개요 | `projects/{slug}/overview/image.{ext}` |
| 프리미엄 카드 | `projects/{slug}/premium/{id}.{ext}` |
| 입지환경 | `projects/{slug}/location/main.{ext}` |
| 갤러리 | `projects/{slug}/gallery/{id}.{ext}` |
| 단지 커뮤니티 | `projects/{slug}/community/{id}.{ext}` |
| 평면도 | `projects/{slug}/floorplans/{id}.{ext}` |

`{slug}` 우선순위: `SITE_STORAGE_SLUG` → SITE_NAME 알려진 매핑 → 라틴 slugify → `site-{hash}`

## 5. DB 마이그레이션

- `supabase/migrations/008_site_settings.sql` — Hero 배경 등 site_settings
- `supabase/migrations/009_project_content.sql` — 사업개요, 프리미엄, 입지, 갤러리, 평면도 테이블

SQL Editor에서 순서대로 실행하세요.
