-- CMS 테이블 일괄 생성 (008 + 009 통합)
-- Supabase Dashboard → SQL Editor → New query → 전체 붙여넣기 → Run
--
-- 실행 후 로컬에서 검증:
--   npm run test:db-schema

-- ========== 008 site_settings ==========
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

grant select on table public.site_settings to anon, authenticated;

drop policy if exists "site_settings_select_public" on public.site_settings;

create policy "site_settings_select_public"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- ========== 009 project content ==========
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

create table if not exists public.project_location (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default '',
  section_title text not null default '입지환경',
  main_image_url text,
  points jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint project_location_site_name_unique unique (site_name)
);

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

-- [6] 단지 커뮤니티
create table if not exists public.project_community (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default '',
  sort_order integer not null default 0,
  title text not null default '',
  subtitle text not null default '',
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_community_site_sort_idx
  on public.project_community (site_name, sort_order);

alter table public.project_overview enable row level security;
alter table public.project_premium enable row level security;
alter table public.project_location enable row level security;
alter table public.project_gallery enable row level security;
alter table public.project_floorplans enable row level security;
alter table public.project_community enable row level security;

grant select on table public.project_overview to anon, authenticated;
grant select on table public.project_premium to anon, authenticated;
grant select on table public.project_location to anon, authenticated;
grant select on table public.project_gallery to anon, authenticated;
grant select on table public.project_floorplans to anon, authenticated;
grant select on table public.project_community to anon, authenticated;

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

drop policy if exists "project_community_select_public" on public.project_community;
create policy "project_community_select_public"
  on public.project_community for select to anon, authenticated using (true);
