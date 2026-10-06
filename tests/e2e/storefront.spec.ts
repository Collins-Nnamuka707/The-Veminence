import { expect, test } from "@playwright/test";

// The root URL follows the browser language and falls back to Polish (the default).
for (const [browserLocale, expected] of [
  ["pl-PL", "pl"],
  ["de-DE", "pl"],
  ["en-GB", "en"],
] as const) {
  test(`root redirects a ${browserLocale} browser to /${expected}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale: browserLocale, baseURL });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`/${expected}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", expected);
    await context.close();
  });
}

test("home page has hreflang alternates", async ({ page }) => {
  await page.goto("/pl");
  for (const lang of ["pl", "en", "x-default"]) {
    await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
  }
});

test("language switcher keeps the current page", async ({ page }) => {
  await page.goto("/pl/shop");
  await page.getByRole("link", { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en\/shop$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("All");
});

test("shop shows every product card state", async ({ page }) => {
  await page.goto("/pl/shop");
  for (const state of ["in_stock", "low_stock", "out_of_stock", "preorder", "coming_soon"]) {
    await expect(page.locator(`article[data-availability="${state}"]`).first()).toBeVisible();
  }
  await expect(page.getByText(/Najniższa cena z 30 dni/).first()).toBeVisible();
});

test("product page renders and links back to shop", async ({ page }) => {
  await page.goto("/pl/product/lucja");
  await expect(page.getByRole("heading", { level: 1, name: "Łucja" })).toBeVisible();
  await page.getByRole("link", { name: /Wróć do sklepu/ }).click();
  await expect(page).toHaveURL(/\/pl\/shop$/);
});

test("unknown pages show the localized 404", async ({ page }) => {
  const response = await page.goto("/en/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("no horizontal scroll", async ({ page }) => {
  for (const path of ["/pl", "/pl/shop", "/pl/product/bianka"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
