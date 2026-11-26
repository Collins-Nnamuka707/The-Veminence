-- Sample catalogue: the same 8 wigs the shop showed before the database existed
-- (lib/data/sample-catalog.ts). Replace them with real products from the admin.
-- Stock goes in through stock_movements and prices through the price_history trigger,
-- exactly like real changes. Sale history is back-dated so the Omnibus line has data.

insert into public.categories (slug, name_en, name_pl, description_en, description_pl, position) values
  ('straight',   'Straight',   'Proste',     'Sleek and glossy',          'Gładkie i lśniące',             1),
  ('wavy',       'Wavy',       'Fale',       'Soft, natural waves',       'Miękkie, naturalne fale',       2),
  ('curly',      'Curly',      'Loki',       'Bouncy, voluminous curls',  'Sprężyste loki pełne objętości', 3),
  ('lace-front', 'Lace front', 'Lace front', 'A natural-looking hairline', 'Naturalna linia włosów',       4)
on conflict (slug) do nothing;

with input (slug, category, name_en, description_en, description_pl, price, status, is_new, preorder, stock, age_days) as (
  values
    ('amelia', 'lace-front', 'Amelia',
     'Long straight human hair wig. 13×4 lace front, 60 cm length.',
     'Długa, prosta peruka z włosów naturalnych. Lace front 13×4, długość 60 cm.',
     129900, 'published', true, false, 12, 1),
    ('bianka', 'wavy', 'Bianka',
     'Soft body waves with a natural shine. 55 cm length.',
     'Miękkie fale body wave z naturalnym połyskiem. Długość 55 cm.',
     149900, 'published', false, false, 8, 2),
    ('celina', 'curly', 'Celina',
     'Full, bouncy deep curls. 45 cm length.',
     'Gęste, sprężyste loki deep curl. Długość 45 cm.',
     139900, 'published', true, false, 2, 3),
    ('dalia', 'straight', 'Dalia',
     'A classic shoulder-length straight bob. Light and comfortable for every day.',
     'Klasyczny prosty bob do ramion. Lekki i wygodny na co dzień.',
     89900, 'published', false, false, 0, 4),
    ('lucja', 'wavy', 'Łucja',
     'Voluminous water waves. 65 cm length.',
     'Fale water wave o dużej objętości. Długość 65 cm.',
     159900, 'published', true, true, 0, 5),
    ('florentyna', 'curly', 'Florentyna',
     'Natural, full kinky curls. 50 cm length.',
     'Naturalne, gęste loki kinky curly. Długość 50 cm.',
     169900, 'coming_soon', true, false, 0, 6),
    ('gaja', 'wavy', 'Gaja',
     'Loose waves in honey blonde. 50 cm length.',
     'Luźne fale w odcieniu miodowego blondu. Długość 50 cm.',
     109900, 'published', false, false, 1, 7),
    ('helena', 'straight', 'Helena',
     'Straight wig with a fringe. 40 cm length.',
     'Prosta peruka z grzywką. Długość 40 cm.',
     99900, 'published', false, false, 6, 8)
),
new_products as (
  insert into public.products (slug, category_id, name_en, description_en, description_pl, status, is_new, allow_preorder, created_at)
  select i.slug, c.id, i.name_en, i.description_en, i.description_pl, i.status, i.is_new, i.preorder,
         now() - make_interval(days => i.age_days)
  from input i join public.categories c on c.slug = i.category
  on conflict (slug) do nothing
  returning id, slug
),
new_variants as (
  insert into public.variants (product_id, price, sku)
  select p.id, i.price, upper(i.slug) || '-STD'
  from new_products p join input i on i.slug = p.slug
  returning id, product_id
)
insert into public.stock_movements (variant_id, change, reason, note)
select v.id, i.stock, 'initial', 'Sample stock'
from new_variants v
join new_products p on p.id = v.product_id
join input i on i.slug = p.slug
where i.stock > 0;

-- Back-date the opening prices so the sales below have 30 days of history.
update public.price_history h
set changed_at = now() - interval '60 days'
from public.variants v join public.products p on p.id = v.product_id
where h.variant_id = v.id and p.slug in ('bianka', 'gaja') and h.sale_price is null
  and not exists (select 1 from public.price_history o where o.variant_id = v.id and o.sale_price is not null);

-- Gaja was briefly 999 zł 20 days ago, then back to 1099 zł.
insert into public.price_history (variant_id, price, changed_at)
select v.id, x.price, now() - x.ago
from public.variants v join public.products p on p.id = v.product_id
cross join (values (99900, interval '20 days'), (109900, interval '10 days')) as x (price, ago)
where p.slug = 'gaja'
  and not exists (select 1 from public.price_history o where o.variant_id = v.id and o.sale_price is not null);

-- Current sales (the trigger records them now).
update public.variants v set sale_price = 119900
from public.products p where p.id = v.product_id and p.slug = 'bianka' and v.sale_price is null;
update public.variants v set sale_price = 94900
from public.products p where p.id = v.product_id and p.slug = 'gaja' and v.sale_price is null;
