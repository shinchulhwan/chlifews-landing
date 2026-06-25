-- customers 관심고객 등록 RLS·RPC 설정
-- Supabase Dashboard → SQL Editor에서 이 파일 전체를 실행하세요.

grant usage on schema public to anon, authenticated;

grant insert on table public.customers to anon, authenticated;

alter table public.customers enable row level security;

drop policy if exists "customers_insert_anon" on public.customers;

create policy "customers_insert_anon"
  on public.customers
  for insert
  to anon, authenticated
  with check (true);

-- RLS 정책이 없을 때를 대비한 SECURITY DEFINER 등록 함수 (anon 실행 허용)
create or replace function public.register_customer(
  p_name text,
  p_phone text,
  p_memo text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (name, phone, memo)
  values (p_name, p_phone, p_memo);
end;
$$;

revoke all on function public.register_customer(text, text, text) from public;
grant execute on function public.register_customer(text, text, text) to anon, authenticated;
