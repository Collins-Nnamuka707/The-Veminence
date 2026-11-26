-- Admin operations for products and stock, each in one transaction.
-- security invoker: they run as the signed-in user, so row-level security and column grants still
-- apply, and each one also refuses non-admins up front.

-- Create a product with its first variant and opening stock.
create function public.admin_create_product(
  p_slug text,
  p_category_id uuid,
  p_name_en text,
  p_name_pl text,
  p_description_en text,
  p_description_pl text,
  p_status text,
  p_is_new boolean,
  p_allow_preorder boolean,
  p_price integer,
  p_sale_price integer,
  p_sku text,
  p_initial_stock integer
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  v_product uuid;
  v_variant uuid;
begin
  if not private.is_admin() then
    raise exception 'Only admins can create products' using errcode = '42501';
  end if;

  insert into public.products
    (slug, category_id, name_en, name_pl, description_en, description_pl, status, is_new, allow_preorder)
  values
    (p_slug, p_category_id, p_name_en, nullif(trim(p_name_pl), ''), coalesce(p_description_en, ''),
     nullif(trim(p_description_pl), ''), p_status, p_is_new, p_allow_preorder)
  returning id into v_product;

  insert into public.variants (product_id, price, sale_price, sku)
  values (v_product, p_price, p_sale_price, nullif(trim(p_sku), ''))
  returning id into v_variant;

  if p_initial_stock > 0 then
    insert into public.stock_movements (variant_id, change, reason, note)
    values (v_variant, p_initial_stock, 'initial', 'Added with the product');
  end if;

  return v_product;
end;
$$;

-- Update a product and its first variant (price changes reach price_history through the trigger).
create function public.admin_update_product(
  p_product_id uuid,
  p_category_id uuid,
  p_name_en text,
  p_name_pl text,
  p_description_en text,
  p_description_pl text,
  p_status text,
  p_is_new boolean,
  p_allow_preorder boolean,
  p_price integer,
  p_sale_price integer,
  p_sku text
) returns void
language plpgsql security invoker set search_path = ''
as $$
declare
  v_variant uuid;
begin
  if not private.is_admin() then
    raise exception 'Only admins can change products' using errcode = '42501';
  end if;

  update public.products set
    category_id = p_category_id,
    name_en = p_name_en,
    name_pl = nullif(trim(p_name_pl), ''),
    description_en = coalesce(p_description_en, ''),
    description_pl = nullif(trim(p_description_pl), ''),
    status = p_status,
    is_new = p_is_new,
    allow_preorder = p_allow_preorder
  where id = p_product_id;
  if not found then
    raise exception 'Product not found' using errcode = 'P0002';
  end if;

  select id into v_variant from public.variants
  where product_id = p_product_id order by position, created_at limit 1;

  -- One statement, so the price > sale_price check sees both new values together.
  update public.variants set
    sale_price = p_sale_price,
    price = p_price,
    sku = nullif(trim(p_sku), '')
  where id = v_variant;
end;
$$;

-- Record a stock change. Modes: 'add' (+quantity), 'remove' (-quantity), 'set' (count the stock:
-- the change is the difference to the current level). Returns the new stock level.
create function public.admin_adjust_stock(
  p_variant_id uuid,
  p_mode text,
  p_quantity integer,
  p_reason text,
  p_note text
) returns integer
language plpgsql security invoker set search_path = ''
as $$
declare
  v_current integer;
  v_change integer;
begin
  if not private.is_admin() then
    raise exception 'Only admins can change stock' using errcode = '42501';
  end if;
  if p_quantity < 0 then
    raise exception 'Quantity must not be negative' using errcode = '22023';
  end if;

  -- Lock the row so two changes at the same time cannot miscount.
  select stock_on_hand into v_current from public.variants where id = p_variant_id for update;
  if not found then
    raise exception 'Variant not found' using errcode = 'P0002';
  end if;

  v_change := case p_mode
    when 'add' then p_quantity
    when 'remove' then -p_quantity
    when 'set' then p_quantity - v_current
  end;
  if v_change is null then
    raise exception 'Unknown stock mode %', p_mode using errcode = '22023';
  end if;

  if v_change <> 0 then
    insert into public.stock_movements (variant_id, change, reason, note)
    values (p_variant_id, v_change, p_reason, coalesce(p_note, ''));
  end if;

  return v_current + v_change;
end;
$$;

revoke all on function public.admin_create_product(text, uuid, text, text, text, text, text, boolean, boolean, integer, integer, text, integer) from public, anon;
revoke all on function public.admin_update_product(uuid, uuid, text, text, text, text, text, boolean, boolean, integer, integer, text) from public, anon;
revoke all on function public.admin_adjust_stock(uuid, text, integer, text, text) from public, anon;
grant execute on function public.admin_create_product(text, uuid, text, text, text, text, text, boolean, boolean, integer, integer, text, integer) to authenticated;
grant execute on function public.admin_update_product(uuid, uuid, text, text, text, text, text, boolean, boolean, integer, integer, text) to authenticated;
grant execute on function public.admin_adjust_stock(uuid, text, integer, text, text) to authenticated;
