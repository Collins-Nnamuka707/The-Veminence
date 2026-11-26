-- Catalogue, stock, prices, settings and admin roles.
-- Orders, reservations and payments come in a later migration (docs/PLAN.md, step 4).
--
-- Rules from CLAUDE.md enforced here:
-- * Row-level security on every table; the public reads published content only.
-- * Every price or sale change writes price_history (trigger), needed for the Omnibus line.
-- * Stock changes only through stock_movements (trigger keeps variants.stock_on_hand in sync;
--   nobody can update stock_on_hand directly).
-- * Money is integer grosze.
-- * Owner-managed text is English; Polish is optional (owner's decision, 2026-11-25).

-- ---------------------------------------------------------------------------
-- Admin roles
-- ---------------------------------------------------------------------------

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create function public.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'owner');
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_owner() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text not null check (length(trim(name_en)) > 0),
  name_pl text,
  description_en text not null default '',
  description_pl text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.categories (id) on delete restrict,
  name_en text not null check (length(trim(name_en)) > 0),
  name_pl text,
  description_en text not null default '',
  description_pl text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'coming_soon', 'archived')),
  is_new boolean not null default false,
  allow_preorder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_id_idx on public.products (category_id);
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Path inside the product-images storage bucket.
  storage_path text not null,
  alt_en text not null default '',
  alt_pl text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_id_idx on public.product_images (product_id);

-- A variant is what customers buy (length, colour...). Prices and stock live here.
create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label_en text not null default 'Standard' check (length(trim(label_en)) > 0),
  label_pl text,
  sku text unique,
  -- Final prices in grosze (the owner is not VAT registered).
  price integer not null check (price > 0),
  sale_price integer check (sale_price is null or (sale_price > 0 and sale_price < price)),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index variants_product_id_idx on public.variants (product_id);
create trigger variants_set_updated_at before update on public.variants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Price history (Omnibus: "lowest price in the 30 days before the discount")
-- ---------------------------------------------------------------------------

create table public.price_history (
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.variants (id) on delete cascade,
  price integer not null,
  sale_price integer,
  -- clock_timestamp so several changes in one transaction keep their order.
  changed_at timestamptz not null default clock_timestamp(),
  changed_by uuid default auth.uid()
);
create index price_history_variant_changed_idx on public.price_history (variant_id, changed_at);

create function public.record_price_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     or new.price is distinct from old.price
     or new.sale_price is distinct from old.sale_price then
    insert into public.price_history (variant_id, price, sale_price)
    values (new.id, new.price, new.sale_price);
  end if;
  return new;
end;
$$;

create trigger variants_record_price_change after insert or update of price, sale_price
  on public.variants for each row execute function public.record_price_change();

-- Lowest price in effect during the 30 days before the current sale started.
-- Null when the variant is not on sale or has no history from before the sale.
create function public.lowest_price_30d(p_variant_id uuid) returns integer
language sql stable security definer set search_path = ''
as $$
  with current_variant as (
    select sale_price from public.variants where id = p_variant_id
  ),
  last_other as (
    -- Last change that did not have the current sale price: the sale started after it.
    select max(h.changed_at) as at
    from public.price_history h, current_variant c
    where h.variant_id = p_variant_id and h.sale_price is distinct from c.sale_price
  ),
  promo as (
    select min(h.changed_at) as started_at
    from public.price_history h, last_other l
    where h.variant_id = p_variant_id and h.changed_at > coalesce(l.at, '-infinity'::timestamptz)
  ),
  in_effect_at_window_start as (
    select max(h.changed_at) as at
    from public.price_history h, promo p
    where h.variant_id = p_variant_id and h.changed_at <= p.started_at - interval '30 days'
  )
  select min(coalesce(h.sale_price, h.price))
  from public.price_history h, promo p, in_effect_at_window_start w, current_variant c
  where c.sale_price is not null
    and h.variant_id = p_variant_id
    and h.changed_at < p.started_at
    and (h.changed_at >= p.started_at - interval '30 days' or h.changed_at = w.at);
$$;

revoke all on function public.lowest_price_30d(uuid) from public;
grant execute on function public.lowest_price_30d(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Stock movements: the only way stock changes
-- ---------------------------------------------------------------------------

create table public.stock_movements (
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.variants (id) on delete cascade,
  change integer not null check (change <> 0),
  reason text not null
    check (reason in ('initial', 'restock', 'adjustment', 'sale', 'return', 'damaged', 'correction')),
  note text not null default '',
  actor uuid default auth.uid(),
  created_at timestamptz not null default clock_timestamp()
);
create index stock_movements_variant_idx on public.stock_movements (variant_id, created_at);

create function public.apply_stock_movement() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- The check constraint on stock_on_hand rejects movements that would go below zero.
  update public.variants set stock_on_hand = stock_on_hand + new.change where id = new.variant_id;
  return new;
end;
$$;

create trigger stock_movements_apply after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();

-- ---------------------------------------------------------------------------
-- Settings (one row)
-- ---------------------------------------------------------------------------

create table public.settings (
  id boolean primary key default true check (id),
  whatsapp_number text not null default '',
  -- Delivery fees in grosze. PLACEHOLDERS until the owner confirms them (docs/TODO.md).
  fee_inpost_locker integer not null default 1599 check (fee_inpost_locker >= 0),
  fee_courier integer not null default 1999 check (fee_courier >= 0),
  fee_pickup integer not null default 0 check (fee_pickup >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);
create trigger settings_set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();
insert into public.settings default values;

-- ---------------------------------------------------------------------------
-- Storefront view: one row per sellable variant of a visible product
-- ---------------------------------------------------------------------------

-- security_invoker: the caller's row-level security applies (drafts stay hidden).
create view public.catalog_variants with (security_invoker = true) as
select
  v.id as variant_id,
  v.product_id,
  v.label_en,
  v.label_pl,
  v.price,
  v.sale_price,
  case when v.sale_price is not null then public.lowest_price_30d(v.id) end as lowest_price_30d,
  -- Reservations will be subtracted here once orders exist.
  v.stock_on_hand as available,
  v.position
from public.variants v
where v.is_active;

-- ---------------------------------------------------------------------------
-- Privileges and row-level security
-- ---------------------------------------------------------------------------

-- Start from nothing, then grant exactly what each role needs.
revoke all on public.admin_users, public.categories, public.products, public.product_images,
  public.variants, public.price_history, public.stock_movements, public.settings,
  public.catalog_variants
  from anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.variants enable row level security;
alter table public.price_history enable row level security;
alter table public.stock_movements enable row level security;
alter table public.settings enable row level security;

-- Admin roles: people can see their own role; roles are granted in the database only.
grant select on public.admin_users to authenticated;
create policy "Read own admin role" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- Categories: public read, admins write.
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
create policy "Anyone reads categories" on public.categories
  for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Products: published and coming-soon products are public; admins see and change all.
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
create policy "Anyone reads visible products" on public.products
  for select to anon, authenticated
  using (status in ('published', 'coming_soon') or public.is_admin());
create policy "Admins manage products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Images follow their product.
grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;
create policy "Anyone reads images of visible products" on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));
create policy "Admins manage images" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Variants: readable with their product. Admins may change everything except stock_on_hand,
-- which only moves through stock_movements.
grant select on public.variants to anon, authenticated;
grant insert (product_id, label_en, label_pl, sku, price, sale_price, position, is_active)
  on public.variants to authenticated;
grant update (label_en, label_pl, sku, price, sale_price, position, is_active)
  on public.variants to authenticated;
grant delete on public.variants to authenticated;
create policy "Anyone reads active variants of visible products" on public.variants
  for select to anon, authenticated
  using ((is_active and exists (select 1 from public.products p where p.id = product_id))
         or public.is_admin());
create policy "Admins manage variants" on public.variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Price history: written by the trigger only; admins can read it.
grant select on public.price_history to authenticated;
create policy "Admins read price history" on public.price_history
  for select to authenticated using (public.is_admin());

-- Stock movements: admins record and read them.
grant select, insert on public.stock_movements to authenticated;
create policy "Admins read stock movements" on public.stock_movements
  for select to authenticated using (public.is_admin());
create policy "Admins record stock movements" on public.stock_movements
  for insert to authenticated with check (public.is_admin());

-- Settings: public read (delivery fees, contact number); only the owner changes them.
grant select on public.settings to anon, authenticated;
grant update (whatsapp_number, fee_inpost_locker, fee_courier, fee_pickup, low_stock_threshold)
  on public.settings to authenticated;
create policy "Anyone reads settings" on public.settings
  for select to anon, authenticated using (true);
create policy "Owner updates settings" on public.settings
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

grant select on public.catalog_variants to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Product photos (storage)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

create policy "Admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "Admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "Admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
