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
  },
});
