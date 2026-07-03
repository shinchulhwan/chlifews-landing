-- Site status for independent deploy lifecycle
alter table public.projects
  add column if not exists status text not null default 'draft';

update public.projects
set status = case when is_published then 'published' else 'draft' end
where status = 'draft';

create index if not exists projects_status_idx on public.projects (status);
