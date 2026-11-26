-- Hardening after Supabase's advisors on 20261125180000_catalog.sql.
--
-- 1. Trigger functions must not be callable through the API (/rest/v1/rpc/...).
-- 2. Helpers used by policies and views move to a `private` schema the API does not expose.
-- 3. Policies call auth functions once per query, not once per row.
-- 4. One permissive policy per role and action (admins' writes no longer add a second SELECT policy).

-- 1. Triggers fire regardless of EXECUTE privilege, so nobody needs to call these directly.
revoke all on function public.record_price_change() from public, anon, authenticated;
revoke all on function public.apply_stock_movement() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- 2. Private helpers.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;
alter function public.is_owner() set schema private;
alter function public.lowest_price_30d(uuid) set schema private;

revoke all on function private.is_admin() from public;
revoke all on function private.is_owner() from public;
revoke all on function private.lowest_price_30d(uuid) from public;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_owner() to anon, authenticated;
grant execute on function private.lowest_price_30d(uuid) to anon, authenticated;

-- The view referenced the function by name; recreate it against the new schema.
create or replace view public.catalog_variants with (security_invoker = true) as
select
  v.id as variant_id,
  v.product_id,
  v.label_en,
  v.label_pl,
  v.price,
  v.sale_price,
  case when v.sale_price is not null then private.lowest_price_30d(v.id) end as lowest_price_30d,
  -- Reservations will be subtracted here once orders exist.
  v.stock_on_hand as available,
  v.position
from public.variants v
where v.is_active;

-- 3 and 4. Rebuild the policies.
drop policy "Read own admin role" on public.admin_users;
create policy "Read own admin role" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

drop policy "Admins manage categories" on public.categories;
create policy "Admins add categories" on public.categories
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change categories" on public.categories
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete categories" on public.categories
  for delete to authenticated using ((select private.is_admin()));

drop policy "Anyone reads visible products" on public.products;
drop policy "Admins manage products" on public.products;
create policy "Anyone reads visible products" on public.products
  for select to anon, authenticated
  using (status in ('published', 'coming_soon') or (select private.is_admin()));
create policy "Admins add products" on public.products
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change products" on public.products
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete products" on public.products
  for delete to authenticated using ((select private.is_admin()));

drop policy "Admins manage images" on public.product_images;
create policy "Admins add images" on public.product_images
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change images" on public.product_images
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete images" on public.product_images
  for delete to authenticated using ((select private.is_admin()));

drop policy "Anyone reads active variants of visible products" on public.variants;
drop policy "Admins manage variants" on public.variants;
create policy "Anyone reads active variants of visible products" on public.variants
  for select to anon, authenticated
  using ((is_active and exists (select 1 from public.products p where p.id = product_id))
         or (select private.is_admin()));
create policy "Admins add variants" on public.variants
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admins change variants" on public.variants
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins delete variants" on public.variants
  for delete to authenticated using ((select private.is_admin()));

drop policy "Admins read price history" on public.price_history;
create policy "Admins read price history" on public.price_history
  for select to authenticated using ((select private.is_admin()));

drop policy "Admins read stock movements" on public.stock_movements;
drop policy "Admins record stock movements" on public.stock_movements;
create policy "Admins read stock movements" on public.stock_movements
  for select to authenticated using ((select private.is_admin()));
create policy "Admins record stock movements" on public.stock_movements
  for insert to authenticated with check ((select private.is_admin()));

drop policy "Owner updates settings" on public.settings;
create policy "Owner updates settings" on public.settings
  for update to authenticated using ((select private.is_owner())) with check ((select private.is_owner()));

drop policy "Admins upload product images" on storage.objects;
drop policy "Admins update product images" on storage.objects;
drop policy "Admins delete product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select private.is_admin()));
create policy "Admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select private.is_admin()));
