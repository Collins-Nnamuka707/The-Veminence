-- "Lace front" moves from a product type to a texture (owner's choice, 2026-11-26): a lace front
-- wig is a Wig with the texture Lace front, next to Straight, Wavy, Curly and Kinky. This undoes
-- 20261126170000_lace_front_type.sql (no product used that type) and adds the category.

update public.products set product_type = 'wig' where product_type = 'lace_front';

alter table public.products drop constraint products_product_type_check;
alter table public.products add constraint products_product_type_check
  check (product_type in ('wig', 'bundle', 'closure', 'frontal'));

insert into public.categories (slug, name_en, name_pl, description_en, description_pl, position) values
  ('lace-front', 'Lace front', 'Lace front',
   'A natural-looking hairline you can part and style',
   'Naturalnie wyglądająca linia włosów, którą możesz dowolnie układać', 5)
on conflict (slug) do nothing;
