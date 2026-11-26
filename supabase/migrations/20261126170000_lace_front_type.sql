-- "Lace front" becomes a product type of its own (owner's request, 2026-11-26), next to wig,
-- bundle, closure and frontal. It has its own collection in the shop (/shop/lace-fronts).
-- Existing products keep their type; the admin functions take the type as text, so only the
-- check constraint changes.

alter table public.products drop constraint products_product_type_check;
alter table public.products add constraint products_product_type_check
  check (product_type in ('wig', 'lace_front', 'bundle', 'closure', 'frontal'));
