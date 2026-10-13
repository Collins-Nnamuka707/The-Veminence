# The Veminence — project guide for Claude Code

Online wig shop for a business in Poland. Customers add wigs to a cart, enter delivery details and
pay on the site with Stripe. Checkout works as a guest; a customer account is optional and keeps
addresses and order history. The owner runs everything from an English-only admin: orders and
their status, revenue per month (current month and the last six), products, prices and stock.
(Owner's decisions, 2026-10-13: Stripe; InPost locker, courier and personal pickup; guest or
account; not VAT registered.)

Full requirements: `docs/SPEC.md` (not yet added; until then follow `docs/PLAN.md`).
Design references (local only, git-ignored): `docs/design/` (`verde.webp` = structure, `femmez.webp` = look,
`aura.webp` = accents). Read the relevant SPEC section before starting any phase.

## Stack

- Next.js 16 (App Router, Cache Components, Partial Prefetching) + TypeScript (strict).
  This version differs from older training data: read `node_modules/next/dist/docs/` first (see AGENTS.md).
  Middleware is `proxy.ts`. Read the locale with `next/root-params`, not request headers.
  The only root layout is `app/[locale]/layout.tsx`; the admin will get its own root layout in `app/admin/`.
  Await `params` inside a `<Suspense>` child, not at the top of a page (instant navigation).
- Tailwind CSS v4 (design tokens in `tailwind.config.ts`, loaded via `@config` in `app/globals.css`;
  reusable classes are declared with `@utility`), shadcn/ui for admin components only
- next-intl for the storefront (`/pl`, `/en`); admin at `/admin`, English only, no i18n
- Supabase (EU region): Postgres, Auth, Storage; migrations in `supabase/migrations`
- Stripe for payments (cards, BLIK, Przelewy24, Apple Pay, Google Pay), in PLN
- Zod for all validation; Resend for email; Vitest + Playwright for tests
- Hosted on Vercel

## Commands

```bash
npm run dev          # local dev
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test         # vitest
npm run test:e2e     # playwright
npm run db:reset     # reset local db, run migrations, load seed
```

Run lint, typecheck and tests before saying a task is done.

## Non-negotiable rules

### Money and prices
- Money is always an integer in grosze (`129900` = 1299,00 zł; Polish formatting only groups
  thousands from five digits up, e.g. 12 345,00 zł). Never floats.
- Format only with `formatPrice()` in `lib/money.ts`
  (`Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })`), on both languages.
- The owner is not VAT registered: prices are final prices, with no VAT line and no NIP field.
  The admin asks for the final price only.
- Every price or sale change writes a row to `price_history` (needed for the Omnibus
  "lowest price in the last 30 days" line). Never update a price without it.

### Orders and stock
- The browser sends only variant ids and quantities. The server recomputes all prices,
  delivery fees and totals.
- Orders are created only by the `create_order` database function, in one transaction:
  re-read prices, lock variant rows, check available stock, write order + items + reservations.
- Available stock = `stock_on_hand` minus active reservations. The storefront only shows available.
- Order status changes only through server actions that also write to `order_events`.
  Statuses: awaiting_payment, paid, processing, shipped, delivered, expired, cancelled.
- Marking paid converts reservations into `stock_movements`. Cancelling or expiring releases them.
- Every stock change writes a `stock_movements` row with a reason and actor.
- `order_items` stores a snapshot of product name, variant label and unit price.
- Delivery methods: InPost parcel locker (store the locker code), courier to the door (full
  address), personal pickup (free). Fees come from `settings`; the server adds them to the total.

### Payments (Stripe)
- The server creates the Stripe payment from the order total in the database, never from
  amounts sent by the browser.
- An order becomes `paid` only from the Stripe webhook, after verifying its signature,
  never from the customer's return to the success page. Handle each event once (idempotent).
- Unpaid orders expire after the reservation window; expiry releases the reservations.
- Never log or store card details; Stripe holds them. Keys stay in environment variables.

### Customer accounts
- Supabase Auth. An account is never required to buy (owner's rule): guest checkout needs only
  contact and delivery details. Checkout offers an unticked "also create an account" box; creating
  that account is best effort and must never stop the payment.
- Clients: `lib/supabase/server.ts` (server code), `lib/supabase/client.ts` (browser, publishable key
  only). `proxy.ts` refreshes the session only when an `sb-` cookie exists, so shop pages stay static.
- Pages reading the user render inside `<Suspense>`; never read cookies in shared layouts.
- Email links land on `/auth/confirm`; redirect targets go through `safeNextPath()` in `lib/auth.ts`.
- Auth forms never reveal whether an email has an account.
- A customer can read only their own orders and addresses (RLS on `auth.uid()`).
- A guest order placed with an email can be linked to an account later with the same email.

### Languages
- No customer-facing string hard-coded in components: use `messages/pl.json` and `messages/en.json`.
- Owner-managed text is stored as `{ pl, en }`. Use `t(field, locale)` from `lib/i18n-content.ts`,
  which falls back to Polish when English is empty.
- Polish is the default locale. Every storefront page needs `hreflang` alternates.
- Fonts must include the Latin Extended subset (ą ć ę ł ń ó ś ź ż).

### Security
- Row-level security on every table. Public can read published content only; all writes go
  through server code or authenticated admin roles (`owner`, `staff`).
- Check admin auth in middleware AND in every admin server action.
- Never expose the Supabase service role key to the client.
- Rate-limit checkout (per IP and per phone) and keep the honeypot field.
- Order confirmation URLs use the unguessable `access_token`, not just the reference.

## Conventions

- Server Components by default; `"use client"` only where interaction needs it.
- Data access in `lib/data/*` (storefront) and `lib/admin/*` (admin); mutations as server actions
  validated with Zod schemas from `lib/schemas/*`.
- Shared storefront components in `components/store/`; admin components in `components/admin/`.
- One `ProductCard` component handles every state: in stock, low stock, out of stock,
  pre-order, on sale, coming soon (see SPEC "Product card and states").
- Mobile-first. Test every storefront and admin screen at 375px wide.
- Images through `next/image`, sized to how they display; lazy-load below the fold.
- Accessibility: labels on every field, alt text on product images, visible focus, AA contrast.
  Gold (`gold`, `gold-dark`) is for fills, and for text on `ink` only (9:1).
  For text on cream use `ink`, `olive` (5.9:1), `muted` (5.0:1) or `sale` (5.1:1).
  `gold-dark` on cream is only 2.7:1 and fails AA, so never use it for text there.
  `muted` on `stone` is 4.1:1, so avoid it for small text.

## Design tokens

| Token | Value |
| --- | --- |
| ink | #141210 |
| cream | #FAF6EE |
| gold | #D4AF6A |
| gold-dark | #B8924C |
| olive | #6B5E3F |
| stone | #E9E1D3 |
| muted | #6F6A63 |
| sale | #B4442F |

Images: 16px radius. Buttons: pill shaped. Script accent font: at most one word per heading.
Do not copy images, logos or text from the reference screenshots.

## WhatsApp

- WhatsApp is a contact channel only, not for ordering or payment (owner's decision, 2026-10-13).
- The footer contact link is built with `buildWhatsAppChatLink()` in `lib/whatsapp.ts`; the number
  comes from `getStoreSettings()` in `lib/data/settings.ts`.
- Don't mention WhatsApp in marketing copy (banners, hero, taglines, meta descriptions).

## Working style

- Work in the phase order in SPEC "Build phases". Plan first, then build.
- Keep changes scoped to the current phase; note anything out of scope in `docs/TODO.md`.
- Write or update tests for any change to order, stock or price logic.
- Ask before adding a new dependency or changing the database schema outside a migration.
