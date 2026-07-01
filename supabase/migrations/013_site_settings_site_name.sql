-- site_settings: 프로젝트별 설정 분리 (site_name + key 복합 PK)
alter table public.site_settings
  add column if not exists site_name text not null default '';

alter table public.site_settings drop constraint if exists site_settings_pkey;

alter table public.site_settings
  add primary key (site_name, key);

create index if not exists site_settings_site_name_idx on public.site_settings (site_name);
