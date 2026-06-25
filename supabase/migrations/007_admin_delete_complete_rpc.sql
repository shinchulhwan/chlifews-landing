-- 관리자 삭제/완료 RPC (RLS 미적용 환경 폴백)
create or replace function public.delete_customer(p_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.customers
  where id::text = p_id;

  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

create or replace function public.complete_customer(p_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.customers
  set status = 'completed'
  where id::text = p_id;

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

grant execute on function public.delete_customer(text) to anon, authenticated;
grant execute on function public.complete_customer(text) to anon, authenticated;
