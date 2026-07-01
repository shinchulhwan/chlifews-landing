-- 단지 커뮤니티 (site_name — 기존 CMS와 동일)

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

alter table public.project_community enable row level security;

grant select on table public.project_community to anon, authenticated;

drop policy if exists "project_community_select_public" on public.project_community;
create policy "project_community_select_public"
  on public.project_community for select to anon, authenticated using (true);

-- INSERT / UPDATE / DELETE: SUPABASE_SERVICE_ROLE_KEY (관리자 API)
