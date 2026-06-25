-- customers.created_at 기본값 보정 (등록 시 now() 자동 저장)
alter table public.customers
  add column if not exists created_at timestamptz;

alter table public.customers
  alter column created_at set default now();
