-- project_community site_name 구조 (레거시 스키마가 다를 때 재생성)
-- 주의: 기존 project_community 데이터는 삭제됩니다.

drop table if exists public.project_community;

create table public.project_community (
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

create index project_community_site_sort_idx
  on public.project_community (site_name, sort_order);

alter table public.project_community enable row level security;

grant select on table public.project_community to anon, authenticated;

create policy "project_community_select_public"
  on public.project_community for select to anon, authenticated using (true);
