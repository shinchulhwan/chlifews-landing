-- customers 테이블 status 컬럼 (관리자 완료 처리)
alter table public.customers
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'completed'));

grant select, update, delete on table public.customers to anon, authenticated;

drop policy if exists "customers_select_anon" on public.customers;
drop policy if exists "customers_update_anon" on public.customers;
drop policy if exists "customers_delete_anon" on public.customers;

create policy "customers_select_anon"
  on public.customers
  for select
  to anon, authenticated
  using (true);

create policy "customers_update_anon"
  on public.customers
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "customers_delete_anon"
  on public.customers
  for delete
  to anon, authenticated
  using (true);
