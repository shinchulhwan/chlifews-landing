-- 랜딩페이지 섹션별 콘텐츠 (site_name으로 멀티 프로젝트 지원)

-- [1] 사업개요 (사이트당 1행)
create table if not exists public.project_overview (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default '',
  section_title text not null default '사업개요',
  description text not null default '',
  image_url text,
  info_cards jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint project_overview_site_name_unique unique (site_name)
);

-- [2] 프리미엄 / 미래가치
-- record_kind: 'section' = 섹션 제목/설명(사이트당 1행), 'card' = 프리미엄 카드
create table if not exists public.project_premium (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default '',
  record_kind text not null default 'card' check (record_kind in ('section', 'card')),
  sort_order integer not null default 0,
  title text not null default '',
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists project_premium_section_unique
  on public.project_premium (site_name)
  where record_kind = 'section';

create index if not exists project_premium_cards_idx
  on public.project_premium (site_name, sort_order)
  where record_kind = 'card';

-- [3] 입지환경 (사이트당 1행, points는 jsonb 배열)
create table if not exists public.project_location (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default '',
  section_title text not null default '입지환경',
  main_image_url text,
  points jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint project_location_site_name_unique unique (site_name)
);

-- [4] 갤러리
create table if not exists public.project_gallery (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default '',
  sort_order integer not null default 0,
  image_url text not null default '',
  title text not null default '',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_gallery_site_sort_idx
  on public.project_gallery (site_name, sort_order);

-- [5] 평면도
create table if not exists public.project_floorplans (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default '',
  sort_order integer not null default 0,
  type_name text not null default '',
  supply_area text not null default '',
  exclusive_area text not null default '',
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_floorplans_site_sort_idx
  on public.project_floorplans (site_name, sort_order);

-- RLS: 공개 읽기, 쓰기는 service role(서버)
alter table public.project_overview enable row level security;
alter table public.project_premium enable row level security;
alter table public.project_location enable row level security;
alter table public.project_gallery enable row level security;
alter table public.project_floorplans enable row level security;

grant select on table public.project_overview to anon, authenticated;
grant select on table public.project_premium to anon, authenticated;
grant select on table public.project_location to anon, authenticated;
grant select on table public.project_gallery to anon, authenticated;
grant select on table public.project_floorplans to anon, authenticated;

drop policy if exists "project_overview_select_public" on public.project_overview;
create policy "project_overview_select_public"
  on public.project_overview for select to anon, authenticated using (true);

drop policy if exists "project_premium_select_public" on public.project_premium;
create policy "project_premium_select_public"
  on public.project_premium for select to anon, authenticated using (true);

drop policy if exists "project_location_select_public" on public.project_location;
create policy "project_location_select_public"
  on public.project_location for select to anon, authenticated using (true);

drop policy if exists "project_gallery_select_public" on public.project_gallery;
create policy "project_gallery_select_public"
  on public.project_gallery for select to anon, authenticated using (true);

drop policy if exists "project_floorplans_select_public" on public.project_floorplans;
create policy "project_floorplans_select_public"
  on public.project_floorplans for select to anon, authenticated using (true);
