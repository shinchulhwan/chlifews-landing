-- 관심고객 테이블 (Supabase SQL Editor에서 실행)
create table if not exists public.interest_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  type text,
  visit_date date,
  memo text,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.interest_customers enable row level security;

create policy "interest_customers_insert_anon"
  on public.interest_customers
  for insert
  to anon
  with check (true);
