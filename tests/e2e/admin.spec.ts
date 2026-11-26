import { expect, test } from "@playwright/test";

// The test server has no Supabase project, so nobody can be an admin: every admin page must
// send people to the admin login, and the login must refuse politely.

test("admin pages require logging in", async ({ page }) => {
  for (const path of [
    "/admin",
    "/admin/products",
    "/admin/products/new",
    "/admin/products/00000000-0000-0000-0000-000000000000",
    "/admin/stock",
    "/admin/orders",
    "/admin/settings",
  ]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/admin\/login$/);
  }
});

test("admin login page works without a session", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("The Veminence admin")).toBeVisible();

  await page.getByLabel("Email").fill("owner@example.com");
  await page.getByLabel("Password").fill("not-a-real-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Supabase is not configured" })).toBeVisible();
});

test("admin login is hidden from search engines and fits on a phone", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the storefront still works next to the admin", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("link", { name: "Shop" }).first()).toBeVisible();
});
