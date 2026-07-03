-- Landing Builder v1 마이그레이션 (012 + 013 + 014 status)
-- Supabase Dashboard → SQL Editor → 전체 붙여넣기 → Run

-- ========== 012 projects ==========
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  site_name text not null unique,
  storage_slug text not null,
  display_name text not null,
  domain text,
  is_published boolean not null default false,
  is_default boolean not null default false,
  cloned_from_id uuid references public.projects (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists projects_site_name_idx on public.projects (site_name);
create index if not exists projects_published_idx on public.projects (is_published)
  where is_published = true;

create unique index if not exists projects_one_default_idx on public.projects (is_default)
  where is_default = true;

alter table public.projects enable row level security;

grant select on table public.projects to anon, authenticated;

drop policy if exists "projects_select_public" on public.projects;

create policy "projects_select_public"
  on public.projects
  for select
  to anon, authenticated
  using (true);

-- ========== 013 site_settings.site_name ==========
alter table public.site_settings
  add column if not exists site_name text not null default '';

alter table public.site_settings drop constraint if exists site_settings_pkey;

alter table public.site_settings
  add primary key (site_name, key);

create index if not exists site_settings_site_name_idx on public.site_settings (site_name);

-- ========== 014 projects.status ==========
alter table public.projects
  add column if not exists status text not null default 'draft';

update public.projects
set status = case when is_published then 'published' else 'draft' end
where status = 'draft';

create index if not exists projects_status_idx on public.projects (status);

