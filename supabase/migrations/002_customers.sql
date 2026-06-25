-- customers 테이블 (관심고객 등록)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  memo text,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;

grant insert on table public.customers to anon, authenticated;

drop policy if exists "customers_insert_anon" on public.customers;

create policy "customers_insert_anon"
  on public.customers
  for insert
  to anon, authenticated
  with check (true);
