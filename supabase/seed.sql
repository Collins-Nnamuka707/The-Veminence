-- Sample catalogue: 8 wigs, a bundle and a closure
-- (lib/data/sample-catalog.ts). Replace them with real products from the admin.
-- Stock goes in through stock_movements and prices through the price_history trigger,
-- exactly like real changes. Sale history is back-dated so the Omnibus line has data.

insert into public.categories (slug, name_en, name_pl, description_en, description_pl, position) values
  ('straight',   'Straight',   'Proste',     'Sleek and glossy',          'Gładkie i lśniące',             1),
  ('wavy',       'Wavy',       'Fale',       'Soft, natural waves',       'Miękkie, naturalne fale',       2),
  ('curly',      'Curly',      'Loki',       'Bouncy, voluminous curls',  'Sprężyste loki pełne objętości', 3),
  ('kinky',      'Kinky',      'Afro',       'Kinky straight and kinky curly, close to natural afro hair',
                                             'Kinky straight i kinky curly, blisko naturalnych włosów afro', 4),
  ('lace-front', 'Lace front', 'Lace front', 'A natural-looking hairline you can part and style',
                                             'Naturalnie wyglądająca linia włosów, którą możesz dowolnie układać', 5)
on conflict (slug) do nothing;

with input (slug, category, product_type, name_en, description_en, description_pl, length_inches, lace_size, density, colour, hair_origin, price, status, is_new, preorder, stock, age_days) as (
  values
    ('amelia', 'straight', 'wig', 'Amelia',
     'Long straight human hair wig. 13×4 lace front, 60 cm length.',
     'Długa, prosta peruka z włosów naturalnych. Lace front 13×4, długość 60 cm.',
     24, '13x4', '180%', 'Natural black', 'Brazilian',
     129900, 'published', true, false, 12, 1),
    ('bianka', 'wavy', 'wig', 'Bianka',
     'Soft body waves with a natural shine. 55 cm length.',
     'Miękkie fale body wave z naturalnym połyskiem. Długość 55 cm.',
     22, '5x5', '180%', 'Natural black', 'Brazilian',
     149900, 'published', false, false, 8, 2),
    ('celina', 'curly', 'wig', 'Celina',
     'Full, bouncy deep curls. 45 cm length.',
     'Gęste, sprężyste loki deep curl. Długość 45 cm.',
     18, '4x4', '200%', 'Natural black', 'Peruvian',
     139900, 'published', true, false, 2, 3),
    ('dalia', 'straight', 'wig', 'Dalia',
     'A classic shoulder-length straight bob. Light and comfortable for every day.',
     'Klasyczny prosty bob do ramion. Lekki i wygodny na co dzień.',
     12, '5x5', '150%', 'Natural black', 'Brazilian',
     89900, 'published', false, false, 0, 4),
    ('lucja', 'wavy', 'wig', 'Łucja',
     'Voluminous water waves. 65 cm length.',
     'Fale water wave o dużej objętości. Długość 65 cm.',
     26, '13x4', '180%', 'Natural black', 'Peruvian',
     159900, 'published', true, true, 0, 5),
    ('florentyna', 'kinky', 'wig', 'Florentyna',
     'Natural, full kinky curls. 50 cm length.',
     'Naturalne, gęste loki kinky curly. Długość 50 cm.',
     20, '13x4', '200%', 'Natural black', 'Brazilian',
     169900, 'coming_soon', true, false, 0, 6),
    ('gaja', 'wavy', 'wig', 'Gaja',
     'Loose waves in honey blonde. 50 cm length.',
     'Luźne fale w odcieniu miodowego blondu. Długość 50 cm.',
     20, '5x5', '180%', 'Honey blonde 27', 'Brazilian',
     109900, 'published', false, false, 1, 7),
    ('helena', 'straight', 'wig', 'Helena',
     'Straight wig with a fringe. 40 cm length.',
     'Prosta peruka z grzywką. Długość 40 cm.',
     16, null, '150%', 'Natural black', 'Peruvian',
     99900, 'published', false, false, 6, 8)
),
new_products as (
  insert into public.products (slug, category_id, product_type, name_en, description_en, description_pl,
                               length_inches, lace_size, density, colour, hair_origin, status, is_new, allow_preorder, created_at)
  select i.slug, c.id, i.product_type, i.name_en, i.description_en, i.description_pl,
         i.length_inches, i.lace_size, i.density, i.colour, i.hair_origin, i.status, i.is_new, i.preorder,
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

-- A bundle and a closure, so every product type has an example.
with input (slug, product_type, name_en, description_en, description_pl, length_inches, lace_size, price, sku, stock, is_new) as (
  values
    ('mila-bundle', 'bundle', 'Mila Bundle',
     'Silky straight human hair bundle, about 100 g. Dye-friendly and easy to blend.',
     'Gładka, prosta pasma z włosów naturalnych, ok. 100 g. Można farbować.',
     18, null, 39900, 'MILA-18', 15, true),
    ('nora-closure', 'closure', 'Nora Closure',
     'HD lace closure with a natural, pre-plucked hairline. Free part.',
     'Zamknięcie z koronki HD z naturalną, wyskubaną linią włosów. Dowolny przedziałek.',
     14, '5x5', 49900, 'NORA-5X5-14', 4, false)
),
new_products as (
  insert into public.products (slug, category_id, product_type, name_en, description_en, description_pl,
                               length_inches, lace_size, colour, hair_origin, status, is_new)
  select i.slug, c.id, i.product_type, i.name_en, i.description_en, i.description_pl,
         i.length_inches, i.lace_size, 'Natural black', 'Brazilian', 'published', i.is_new
  from input i join public.categories c on c.slug = 'straight'
  on conflict (slug) do nothing
  returning id, slug
),
new_variants as (
  insert into public.variants (product_id, price, sku)
  select p.id, i.price, i.sku from new_products p join input i on i.slug = p.slug
  returning id, product_id
)
insert into public.stock_movements (variant_id, change, reason, note)
select v.id, i.stock, 'initial', 'Sample stock'
from new_variants v join new_products p on p.id = v.product_id join input i on i.slug = p.slug;
