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

## Owner decisions (2026-10-13)

Customers pay on the site; WhatsApp is only a contact link. Stripe for payments. Delivery by
InPost parcel locker, courier, or personal pickup. Guest checkout with an optional account.
Not VAT registered. An earlier "order on WhatsApp" approach was dropped the same day.

## Phase 2 — Cart ✅

- Cart stored in the browser (product/variant ids and quantities only); header cart icon with count
- "Add to cart" on the product page; cart page to change quantities and remove items
- Totals shown in the cart are a preview; the server recomputes everything at checkout
- "You may also like" on product pages and "Complete your look" suggestions in the cart

## Phase 3 — Database (Supabase, EU region)

Needs: a Supabase project in the EU region (the owner creates it).

- Migrations: categories, products, variants, price_history, settings, customers, addresses,
  orders, order_items, reservations, stock_movements, order_events, payments, admin roles
- RLS on every table (public reads published content; customers read only their own orders)
- Views/functions for available stock and the 30-day lowest price; `create_order` function
- Seed data; swap `lib/data/catalog.ts` from sample data to Supabase queries
- Product photos in Supabase Storage, served via `next/image`

## Phase 4 — Checkout and payment (started early)

Needs: a Stripe account in test mode (the owner creates it).

Done: checkout page (contact, delivery method, locker code or address, notes), live totals with
delivery fees, Zod validation on both sides, honeypot, server-side pricing, Stripe Checkout
session (cards, BLIK, Przelewy24, wallets) with delivery details in metadata, success page.
Still to do (needs the database): create_order and stock reservations, Stripe webhook marking
orders paid, order expiry, confirmation email, rate limiting.

- Checkout form (Zod): email, name, phone, delivery method; locker code or address
- Delivery fees from `settings`; honeypot and rate limiting
- `create_order` reserves stock; Stripe payment for the server-side total (cards, BLIK, Przelewy24)
- Stripe webhook marks the order paid and converts reservations to stock movements
- Unpaid orders expire and release stock; confirmation page at an `access_token` URL; email via Resend

## Phase 5 — Customer accounts (started early)

Needs: the Supabase project (keys in `.env.local`).

Done: create account (with email confirmation), log in, log out, forgot/reset password,
My account page with editable name and phone, optional "also create an account" box at
checkout (guest checkout stays the default), header account icon, session refresh in
`proxy.ts`, email links handled at `/auth/confirm`, checkout prefill and "log in" link,
Supabase user id attached to the Stripe payment.
Still to do (needs the database): order history and status, saved addresses,
linking earlier guest orders with the same email.

## Phase 6 — Admin (`/admin`, English only)

- Admin login (`owner`, `staff`); checks in `proxy.ts` and in every server action
- Dashboard: revenue this month, a chart of revenue for each of the last six months,
  order count and average order value, low-stock alerts
- Orders: list and filters, order detail with delivery details, status changes
  (paid → processing → shipped → delivered, cancel) writing `order_events`
- Products: create and edit, photos, prices (every change writes `price_history`), sales
- Stock: current stock per product, manual adjustments with a reason (`stock_movements`)
- Settings: delivery fees, contact number, low-stock threshold

## Phase 7 — Content, legal and launch

- About, contact, delivery & returns, FAQ
- Legal pages required in Poland for online sales: regulamin (terms), privacy policy (RODO/GDPR),
  14-day right of withdrawal and returns form, complaints (reklamacje)
- Cookie consent if analytics are added
- sitemap.xml, robots.txt, Open Graph images, structured data
- Stripe live mode, Vercel deployment, domain, environment variables
