# TODO (out of scope for the current phase)

## Needs the owner

- [ ] Add `docs/SPEC.md` (CLAUDE.md refers to it; Phase 1 used `docs/PLAN.md` instead)
- [ ] Logo file (header/footer use a text wordmark in `components/store/Logo.tsx`)
- [ ] Product photos (cards show a decorative hair-pattern placeholder until then)
- [ ] Real product list, prices and descriptions (Phase 1 uses `lib/data/sample-catalog.ts`)
- [ ] WhatsApp number and message templates
- [ ] Confirm: should `/` follow the browser language (current) or always go to `/pl`?

## Technical

- [ ] Localized URL paths (`/pl/sklep`, `/pl/produkt/...`) via next-intl `pathnames` — better Polish SEO
- [ ] Move `LOW_STOCK_THRESHOLD` (`lib/product-state.ts`) into `settings`
- [ ] Cart icon in the header (cart phase)
- [ ] Replace the "ordering coming soon" note on the product page with the variant picker + add to cart
- [ ] `npm audit` reports 5 high-severity issues in dev dependencies from the Next.js template; review before launch
