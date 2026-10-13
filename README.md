# The Veminence

Online wig shop for a business in Poland. Customers order on the site and pay on WhatsApp.

- Project rules: [CLAUDE.md](CLAUDE.md)
- Build phases: [docs/PLAN.md](docs/PLAN.md)
- Open items: [docs/TODO.md](docs/TODO.md)

## Getting started

Requires Node.js 24 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 (redirects to `/pl` or `/en` based on the browser language).

## Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

`test:e2e` builds the site and runs Playwright at 375px and desktop widths.
The first time, install the browser with `npx playwright install chromium`.
