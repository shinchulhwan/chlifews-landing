-- site_settings: 랜딩페이지 공통 설정 (hero_background, logo, favicon 등)
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

-- INSERT/UPDATE/DELETE는 service role(서버)로만 수행
