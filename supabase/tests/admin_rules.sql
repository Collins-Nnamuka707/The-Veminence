-- Behaviour checks for the admin product and stock functions, run as real roles:
-- an owner from admin_users, and a signed-in customer. Rolled back at the end (ALL_TESTS_PASSED).
--   npx supabase db query --remote --yes -f supabase/tests/admin_rules.sql
do $$
declare
  owner_id uuid; cat uuid; p uuid; v uuid; level integer; history integer; rejected boolean;
begin
  select user_id into owner_id from public.admin_users where role = 'owner' limit 1;
  assert owner_id is not null, 'needs an owner in admin_users';
  select id into cat from public.categories order by position limit 1;

  -- Act as the owner (what Supabase does for a signed-in request).
  perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  p := public.admin_create_product('zz-admin-test', cat, 'wig', 'Test wig', null, 'English text', 'Polski tekst',
                                   16, '5x5', '180%', 'Natural black', 'Brazilian',
                                   'draft', true, false, 120000, null, 'ZZ-1', 4);
  assert (select lace_size from public.products where id = p) = '5x5', 'details should be saved';
  select id, stock_on_hand into v, level from public.variants where product_id = p;
  assert level = 4, format('opening stock should be 4, got %s', level);
  select count(*) into history from public.price_history where variant_id = v;
  assert history = 1, 'creating should record the first price';

  -- Editing: a sale is recorded in price history; other fields change without a price row.
  perform public.admin_update_product(p, cat, 'closure', 'Test wig 2', 'Peruka', 'English', null,
                                      14, '  ', null, null, null, 'published', false, true, 120000, 99000, 'ZZ-1');
  assert (select product_type from public.products where id = p) = 'closure', 'type should change';
  -- Lace front is a texture, not a type (owner, 2026-11-26); unknown types are refused.
  assert exists (select 1 from public.categories where slug = 'lace-front'), 'lace front texture should exist';
  begin
    update public.products set product_type = 'lace_front' where id = p;
    rejected := false;
  exception when check_violation then
    rejected := true;
  end;
  assert rejected, 'lace_front should no longer be a product type';
  update public.products set product_type = 'closure' where id = p;
  assert (select lace_size from public.products where id = p) is null, 'blank lace size should be null';
  select count(*) into history from public.price_history where variant_id = v;
  assert history = 2, format('the sale should add a price history row, got %s rows', history);
  assert (select name_en from public.products where id = p) = 'Test wig 2', 'name should change';
  assert (select description_pl from public.products where id = p) is null, 'empty Polish should be null';

  -- Stock: add, remove, count.
  level := public.admin_adjust_stock(v, 'add', 6, 'restock', 'Delivery');
  assert level = 10, format('after +6 expected 10, got %s', level);
  level := public.admin_adjust_stock(v, 'remove', 3, 'damaged', 'Torn lace');
  assert level = 7, format('after -3 expected 7, got %s', level);
  level := public.admin_adjust_stock(v, 'set', 5, 'correction', 'Stock count');
  assert level = 5, format('after counting expected 5, got %s', level);
  assert (select count(*) from public.stock_movements where variant_id = v) = 4,
    'opening + 3 changes should be 4 movements';
  assert (select actor from public.stock_movements where variant_id = v order by id desc limit 1) = owner_id,
    'movements record who made them';

  rejected := false;
  begin
    perform public.admin_adjust_stock(v, 'remove', 99, 'damaged', '');
  exception when check_violation then rejected := true;
  end;
  assert rejected, 'stock must not go below zero';

  -- A signed-in customer (no admin role) is refused everywhere.
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  rejected := false;
  begin
    perform public.admin_create_product('zz-customer', cat, 'wig', 'x', null, '', null, null, null, null, null, null,
                                        'draft', false, false, 100, null, null, 0);
  exception when insufficient_privilege then rejected := true;
  end;
  assert rejected, 'customers must not create products';
  rejected := false;
  begin
    perform public.admin_adjust_stock(v, 'add', 1, 'restock', '');
  exception when insufficient_privilege then rejected := true;
  end;
  assert rejected, 'customers must not change stock';

  raise exception 'ALL_TESTS_PASSED';
end $$;
