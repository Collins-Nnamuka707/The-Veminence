-- Behaviour checks for the catalogue migration. Run against the linked project with:
--   npx supabase db query --remote -f supabase/tests/catalog_rules.sql
-- Everything happens inside one block that ends by raising ALL_TESTS_PASSED,
-- which rolls back all test data. Any other error means a check failed.
do $$
declare
  c uuid; p uuid; v uuid; lowest integer; history integer; on_hand integer; rejected boolean;
begin
  insert into public.categories (slug, name_en) values ('zz-test', 'Test') returning id into c;
  insert into public.products (slug, category_id, name_en, status)
    values ('zz-test', c, 'Test wig', 'published') returning id into p;
  insert into public.variants (product_id, price) values (p, 100000) returning id into v;

  -- Price history is written on insert and on every price/sale change, never otherwise.
  select count(*) into history from public.price_history where variant_id = v;
  assert history = 1, format('insert should write 1 history row, got %s', history);
  update public.variants set label_en = 'Long' where id = v;
  select count(*) into history from public.price_history where variant_id = v;
  assert history = 1, 'changing the label must not write price history';

  -- Omnibus: 1000 zł for months, 900 zł for a while 20 days ago, back to 1000 zł, then a sale.
  update public.price_history set changed_at = now() - interval '60 days' where variant_id = v;
  insert into public.price_history (variant_id, price, changed_at) values (v, 90000, now() - interval '20 days');
  insert into public.price_history (variant_id, price, changed_at) values (v, 100000, now() - interval '10 days');
  update public.variants set sale_price = 80000 where id = v;
  select private.lowest_price_30d(v) into lowest;
  assert lowest = 90000, format('lowest price in 30 days before the sale should be 90000, got %s', lowest);

  -- A price seen more than 30 days before the sale does not count, unless still in effect then.
  update public.price_history set changed_at = now() - interval '40 days'
    where variant_id = v and price = 90000;
  select private.lowest_price_30d(v) into lowest;
  assert lowest = 90000, format('price in effect at the window start should count, got %s', lowest);
  -- Back to 1000 zł 35 days ago: 900 zł was replaced before the window, so it no longer counts.
  insert into public.price_history (variant_id, price, changed_at) values (v, 100000, now() - interval '35 days');
  select private.lowest_price_30d(v) into lowest;
  assert lowest = 100000, format('a price replaced before the window should not count, got %s', lowest);

  -- No sale, no Omnibus figure.
  update public.variants set sale_price = null where id = v;
  assert private.lowest_price_30d(v) is null, 'no sale should give null';

  -- Stock moves only through stock_movements and cannot go below zero.
  insert into public.stock_movements (variant_id, change, reason) values (v, 5, 'initial');
  insert into public.stock_movements (variant_id, change, reason) values (v, -2, 'sale');
  select stock_on_hand into on_hand from public.variants where id = v;
  assert on_hand = 3, format('stock should be 3, got %s', on_hand);
  rejected := false;
  begin
    insert into public.stock_movements (variant_id, change, reason) values (v, -4, 'sale');
  exception when check_violation then rejected := true;
  end;
  assert rejected, 'stock must not go below zero';

  -- Prices are integers in grosze; a sale must be below the price.
  rejected := false;
  begin
    update public.variants set sale_price = 100000 where id = v;
  exception when check_violation then rejected := true;
  end;
  assert rejected, 'sale price equal to the price must be rejected';

  raise exception 'ALL_TESTS_PASSED';
end $$;
