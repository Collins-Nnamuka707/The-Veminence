import { defineConfig, devices } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    // CLAUDE.md: test every storefront screen at 375px wide.
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${port}`,
    url: `http://localhost:${port}/pl`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    // Tests never talk to the real Supabase project or Stripe: empty values switch them off
    // (Next.js does not override variables that are already set, even from .env.local).
    env: {
      WHATSAPP_NUMBER: "+48 000 000 000",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      STRIPE_SECRET_KEY: "",
      // Fixed euro rate so tests don't depend on the live NBP service.
      EUR_PLN_RATE: "4.25",
      // Tests use the built-in sample catalogue, never the real database.
      CATALOG_SOURCE: "sample",
    },
  },
});
