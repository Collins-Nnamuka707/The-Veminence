# TODO (out of scope for the current phase)

## Needs the owner

- [ ] Add `docs/SPEC.md` (CLAUDE.md refers to it; Phase 1 used `docs/PLAN.md` instead)
- [ ] Logo file (header/footer use a text wordmark in `components/store/Logo.tsx`)
- [ ] Product photos (cards show a plain grey placeholder until then), plus photos for the home banner, the three type tiles and the four texture tiles (dark/grey blocks until then)
- [ ] Review the home page wording: hero headline, promise strip, "Why The Veminence?" and the FAQ answers (`messages/en.json`, `messages/pl.json`); add an offer to the banner when there is one
- [ ] Add FAQ answers for returns and delivery times once the policies are decided
- [ ] Real product list, prices and descriptions (Phase 1 uses `lib/data/sample-catalog.ts`)
- [ ] Real WhatsApp contact number: set `WHATSAPP_NUMBER` in `.env.local` (currently the placeholder +48 000 000 000) and in Vercel
- [x] Create a Supabase project (EU region) and put the URL and publishable key in `.env.local`
- [ ] Before launch: upgrade Supabase to Pro (daily backups, no pausing after a week of inactivity), then turn on leaked-password protection (Authentication → Policies)
- [ ] Buy the shop's domain (needed for the website address and for sending email)
- [ ] Before launch: Resend with that domain as Supabase's SMTP sender (Authentication → Emails → Set up SMTP); the built-in sender is test-only and allows ~2 emails/hour
- [ ] Then paste the email templates from `docs/email-templates.md` (Supabase only allows editing them with custom SMTP)
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
- [ ] Use `settings.low_stock_threshold` (already in the database and `getStoreSettings()`) instead of the `LOW_STOCK_THRESHOLD` constant in `lib/product-state.ts`
- [ ] Variant picker (length/colour) on the product page, and adding variants in the admin (products have one variant for now)
- [ ] Admin: manage categories (add, rename, reorder); the 5 textures are fixed for now
- [ ] Admin: reorder photos / choose the main photo (the first uploaded is the main one)
- [ ] Orders migration (step 4): `order_items.variant_id` must reference variants `on delete restrict`, so a product that was ever ordered can't be deleted (the admin delete action already turns that error into "archive it instead")
