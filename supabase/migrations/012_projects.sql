-- CH Labs projects registry (Landing Builder v1)
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
  using (is_published = true or true);

-- INSERT/UPDATE/DELETE는 service role(서버)로만 수행
