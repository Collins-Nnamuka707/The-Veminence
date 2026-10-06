# Build plan

`docs/SPEC.md` was not available when work started, so this plan was drawn up from CLAUDE.md.
When SPEC.md is added, its "Build phases" section takes precedence; reconcile this file with it.

## Phase 1 — Foundation and storefront shell ✅

- Next.js 16 (App Router, Cache Components, Turbopack), TypeScript strict, Tailwind v4 with tokens in `tailwind.config.ts`
- next-intl routing: `/pl` (default) and `/en`, browser-language detection, hreflang on every page
- Fonts with Latin Extended (Jost, Cormorant Garamond, Pinyon Script)
- `lib/money.ts` (`formatPrice`), `lib/i18n-content.ts` (`t`), `lib/whatsapp.ts` (`buildWhatsAppLink`) with unit tests
- `ProductCard` with all six states, Omnibus lowest-price line
- Pages: home, shop, shop by category, product (read-only), localized 404
- Sample catalogue in `lib/data/sample-catalog.ts` behind `lib/data/catalog.ts`
- Vitest unit tests and Playwright e2e at 375px and desktop

## Phase 2 — Database (Supabase, EU region)

Needs: a Supabase project (EU) or local Supabase CLI + Docker.

- Migrations: categories, products, variants, price_history, settings, orders, order_items,
  reservations, stock_movements, order_events, admin roles (`owner`, `staff`)
- RLS on every table (public reads published content only)
- Views/functions for available stock (`stock_on_hand` − active reservations) and 30-day lowest price
- Seed data; swap `lib/data/catalog.ts` from sample data to Supabase queries
- Product photos in Supabase Storage, served via `next/image`

## Phase 3 — Cart and checkout

- Cart (client stores only variant ids + quantities), variant picker on the product page
- Checkout form (Zod), honeypot, rate limiting per IP and phone
- `create_order` database function (single transaction, locks variants, writes reservations)
- Confirmation page at an `access_token` URL, WhatsApp link, Resend confirmation email
- Reservation expiry job

## Phase 4 — Admin (`/admin`, English only)

- Supabase Auth; checks in `proxy.ts` and in every server action
- Products, variants, gross prices (every change writes `price_history`), stock movements
- Orders: status changes via server actions writing `order_events`; mark paid / cancel / expire
- Settings: WhatsApp number, PL/EN message templates, low-stock threshold

## Phase 5 — Content, legal and launch

- About, contact, delivery & returns, FAQ
- Legal pages required in Poland: regulamin (terms), privacy policy (RODO/GDPR), returns/withdrawal
- Cookie consent if analytics are added
- sitemap.xml, robots.txt, Open Graph images, structured data
- Vercel deployment, domain, environment variables
