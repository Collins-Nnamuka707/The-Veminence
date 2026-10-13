# TODO (out of scope for the current phase)

## Needs the owner

- [ ] Add `docs/SPEC.md` (CLAUDE.md refers to it; Phase 1 used `docs/PLAN.md` instead)
- [ ] Logo file (header/footer use a text wordmark in `components/store/Logo.tsx`)
- [ ] Product photos (cards show a decorative hair-pattern placeholder until then)
- [ ] Real product list, prices and descriptions (Phase 1 uses `lib/data/sample-catalog.ts`)
- [ ] Real WhatsApp contact number: set `WHATSAPP_NUMBER` in `.env.local` (currently the placeholder +48 000 000 000) and in Vercel
- [ ] Create a Supabase project (EU region) and put the URL and publishable key in `.env.local`
- [ ] Supabase Auth settings: Site URL, Redirect URLs (`http://localhost:3000/**` and the live domain), email templates in Polish, minimum password length 8
- [ ] Create a Stripe account (test mode is enough to start), enable BLIK and Przelewy24, put the test secret key in `.env.local`
- [ ] Delivery fees: PLACEHOLDERS in `lib/data/settings.ts` (locker 15,99 zł, courier 19,99 zł, pickup free); confirm real fees and any free-delivery threshold
- [ ] Pickup address or area to show customers who choose personal pickup
- [ ] Pre-orders: take full payment at order time, or a deposit?
- [ ] Business details for the legal pages (company name, address, NIP/REGON if any, contact email)
- [ ] Confirm: should `/` follow the browser language (current) or always go to `/pl`?

## Technical

- [ ] Best sellers: compute `salesCount` from paid orders (e.g. last 90 days) instead of the sample numbers
- [ ] New in: base it on the product's publish date (e.g. last 30 days) instead of the `isNew` flag
- [ ] Stripe webhook (`checkout.session.completed`, async payment events) to mark orders paid — with the database
- [ ] Until orders are stored, paid orders and delivery details are visible only in the Stripe dashboard
- [ ] Order confirmation email (Resend) and rate limiting per IP/phone — with the database
- [ ] InPost Geowidget (map picker) instead of typing the locker code — needs an InPost account
- [ ] Terms acceptance at checkout and at account sign-up, and legal pages (regulamin, privacy, withdrawal) before going live
- [ ] Account deletion on request (RODO/GDPR right to erasure)

- [ ] Localized URL paths (`/pl/sklep`, `/pl/produkt/...`) via next-intl `pathnames` — better Polish SEO
- [ ] Move `LOW_STOCK_THRESHOLD` (`lib/product-state.ts`) into `settings`
- [ ] Variant picker (length/colour) on the product page
- [ ] `npm audit` reports 5 high-severity issues in dev dependencies from the Next.js template; review before launch
