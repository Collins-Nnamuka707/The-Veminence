# The Veminence — project guide for Claude Code

Online wig shop for a business in Poland. Customers browse, add to cart and place an order;
payment happens on WhatsApp, not on the site. The owner runs everything from an English-only admin.

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
- Prices shown to customers include VAT. The admin only asks for gross prices.
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

- Order link: `https://wa.me/<number>?text=<encoded message>`; number and PL/EN templates come
  from `settings`. Build it with `buildWhatsAppLink()` in `lib/whatsapp.ts`.
- Keep the message short (reference, items, delivery, total, name); long links fail on some phones.

## Working style

- Work in the phase order in SPEC "Build phases". Plan first, then build.
- Keep changes scoped to the current phase; note anything out of scope in `docs/TODO.md`.
- Write or update tests for any change to order, stock or price logic.
- Ask before adding a new dependency or changing the database schema outside a migration.
