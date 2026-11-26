-- Product details (owner's decisions, 2026-11-26): the shop sells wigs, bundles, closures and
-- frontals. Each product has fixed details (a 12" and a 16" version are separate products):
-- type, texture (the categories table), length, lace/closure size, and optional density,
-- colour and hair origin.

alter table public.products
  add column product_type text not null default 'wig'
    check (product_type in ('wig', 'bundle', 'closure', 'frontal')),
  add column length_inches integer check (length_inches between 4 and 40),
  add column lace_size text check (lace_size is null or length(lace_size) between 1 and 20),
  add column density text check (density is null or length(density) between 1 and 20),
  add column colour text check (colour is null or length(colour) between 1 and 40),
  add column hair_origin text check (hair_origin is null or length(hair_origin) between 1 and 40);

create index products_product_type_idx on public.products (product_type);

-- Categories are now textures. "Lace front" was a lace type, not a texture: its products move
-- to Straight (the lace now lives in lace_size) and the category becomes Kinky.
update public.products p set category_id = s.id
from public.categories lf, public.categories s
where lf.slug = 'lace-front' and s.slug = 'straight' and p.category_id = lf.id;

update public.categories set
  slug = 'kinky',
  name_en = 'Kinky',
  name_pl = 'Afro',
  description_en = 'Kinky straight and kinky curly, close to natural afro hair',
  description_pl = 'Kinky straight i kinky curly, blisko naturalnych włosów afro'
where slug = 'lace-front';

-- Details for the sample wigs (no effect on databases without them).
update public.products as p set
  length_inches = d.length_inches,
  lace_size = d.lace_size,
  density = d.density,
  colour = d.colour,
  hair_origin = d.hair_origin
from (values
  ('amelia',     24, '13x4', '180%', 'Natural black',  'Brazilian'),
  ('bianka',     22, '5x5',  '180%', 'Natural black',  'Brazilian'),
  ('celina',     18, '4x4',  '200%', 'Natural black',  'Peruvian'),
  ('dalia',      12, '5x5',  '150%', 'Natural black',  'Brazilian'),
  ('lucja',      26, '13x4', '180%', 'Natural black',  'Peruvian'),
  ('florentyna', 20, '13x4', '200%', 'Natural black',  'Brazilian'),
  ('gaja',       20, '5x5',  '180%', 'Honey blonde 27', 'Brazilian'),
  ('helena',     16, null,   '150%', 'Natural black',  'Peruvian')
) as d (slug, length_inches, lace_size, density, colour, hair_origin)
where p.slug = d.slug;

update public.products p set category_id = k.id
from public.categories k
where k.slug = 'kinky' and p.slug = 'florentyna';

-- The admin functions gain the new fields. Postgres cannot add parameters in place, so they are
-- dropped and created again with the same rules as before.
drop function public.admin_create_product(text, uuid, text, text, text, text, text, boolean, boolean, integer, integer, text, integer);
drop function public.admin_update_product(uuid, uuid, text, text, text, text, text, boolean, boolean, integer, integer, text);

create function public.admin_create_product(
  p_slug text,
  p_category_id uuid,
  p_product_type text,
  p_name_en text,
  p_name_pl text,
  p_description_en text,
  p_description_pl text,
  p_length_inches integer,
  p_lace_size text,
  p_density text,
  p_colour text,
  p_hair_origin text,
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
    (slug, category_id, product_type, name_en, name_pl, description_en, description_pl,
     length_inches, lace_size, density, colour, hair_origin, status, is_new, allow_preorder)
  values
    (p_slug, p_category_id, p_product_type, p_name_en, nullif(trim(p_name_pl), ''),
     coalesce(p_description_en, ''), nullif(trim(p_description_pl), ''),
     p_length_inches, nullif(trim(p_lace_size), ''), nullif(trim(p_density), ''),
     nullif(trim(p_colour), ''), nullif(trim(p_hair_origin), ''),
     p_status, p_is_new, p_allow_preorder)
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

create function public.admin_update_product(
  p_product_id uuid,
  p_category_id uuid,
  p_product_type text,
  p_name_en text,
  p_name_pl text,
  p_description_en text,
  p_description_pl text,
  p_length_inches integer,
  p_lace_size text,
  p_density text,
  p_colour text,
  p_hair_origin text,
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
    product_type = p_product_type,
    name_en = p_name_en,
    name_pl = nullif(trim(p_name_pl), ''),
    description_en = coalesce(p_description_en, ''),
    description_pl = nullif(trim(p_description_pl), ''),
    length_inches = p_length_inches,
    lace_size = nullif(trim(p_lace_size), ''),
    density = nullif(trim(p_density), ''),
    colour = nullif(trim(p_colour), ''),
    hair_origin = nullif(trim(p_hair_origin), ''),
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

revoke all on function public.admin_create_product(text, uuid, text, text, text, text, text, integer, text, text, text, text, text, boolean, boolean, integer, integer, text, integer) from public, anon;
revoke all on function public.admin_update_product(uuid, uuid, text, text, text, text, text, integer, text, text, text, text, text, boolean, boolean, integer, integer, text) from public, anon;
grant execute on function public.admin_create_product(text, uuid, text, text, text, text, text, integer, text, text, text, text, text, boolean, boolean, integer, integer, text, integer) to authenticated;
grant execute on function public.admin_update_product(uuid, uuid, text, text, text, text, text, integer, text, text, text, text, text, boolean, boolean, integer, integer, text) to authenticated;

-- Two samples of the new product types, only where the sample wigs exist.
do $$
declare
  v_straight uuid;
  v_product uuid;
  v_variant uuid;
begin
  if not exists (select 1 from public.products where slug = 'amelia')
     or exists (select 1 from public.products where slug in ('mila-bundle', 'nora-closure')) then
    return;
  end if;
  select id into v_straight from public.categories where slug = 'straight';

  insert into public.products (slug, category_id, product_type, name_en, description_en, description_pl,
                               length_inches, colour, hair_origin, status, is_new)
  values ('mila-bundle', v_straight, 'bundle', 'Mila Bundle',
          'Silky straight human hair bundle, about 100 g. Dye-friendly and easy to blend.',
          'Gładka, prosta pasma z włosów naturalnych, ok. 100 g. Można farbować.',
          18, 'Natural black', 'Brazilian', 'published', true)
  returning id into v_product;
  insert into public.variants (product_id, price, sku) values (v_product, 39900, 'MILA-18') returning id into v_variant;
  insert into public.stock_movements (variant_id, change, reason, note) values (v_variant, 15, 'initial', 'Sample stock');

  insert into public.products (slug, category_id, product_type, name_en, description_en, description_pl,
                               length_inches, lace_size, colour, hair_origin, status, is_new)
  values ('nora-closure', v_straight, 'closure', 'Nora Closure',
          'HD lace closure with a natural, pre-plucked hairline. Free part.',
          'Zamknięcie z koronki HD z naturalną, wyskubaną linią włosów. Dowolny przedziałek.',
          14, '5x5', 'Natural black', 'Brazilian', 'published', false)
  returning id into v_product;
  insert into public.variants (product_id, price, sku) values (v_product, 49900, 'NORA-5X5-14') returning id into v_variant;
  insert into public.stock_movements (variant_id, change, reason, note) values (v_variant, 4, 'initial', 'Sample stock');
end $$;
