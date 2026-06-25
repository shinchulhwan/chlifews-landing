-- customers.site_name 컬럼 (멀티 랜딩페이지 구분)
alter table public.customers
  add column if not exists site_name text not null default '';

-- RPC 폴백 등록 함수에 site_name 추가
drop function if exists public.register_customer(text, text, text);

create or replace function public.register_customer(
  p_name text,
  p_phone text,
  p_memo text default null,
  p_site_name text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (name, phone, memo, site_name)
  values (p_name, p_phone, p_memo, coalesce(p_site_name, ''));
end;
$$;

revoke all on function public.register_customer(text, text, text, text) from public;
grant execute on function public.register_customer(text, text, text, text) to anon, authenticated;
