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

test("add wigs to the cart, change quantities and remove them", async ({ page }) => {
  await page.goto("/pl/product/gaja");
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await expect(page.getByText("Dodano do koszyka.")).toBeVisible();
  // Gaja has 1 left, so the button is now disabled.
  await expect(page.getByRole("button", { name: "Dodaj do koszyka" })).toBeDisabled();

  await page.goto("/pl/product/amelia");
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await expect(page.getByRole("link", { name: "Koszyk, 2 produkty" })).toBeVisible();

  await page.getByRole("link", { name: /Zobacz koszyk/ }).click();
  await expect(page).toHaveURL(/\/pl\/cart$/);
  await expect(page.getByTestId("cart-row")).toHaveCount(2);
  // 949,00 (Gaja, on sale) + 1299,00 (Amelia)
  await expect(page.getByText(/2248,00/)).toBeVisible();

  await page.getByRole("group", { name: "Ilość: Amelia" }).getByRole("button", { name: "Zwiększ ilość" }).click();
  await expect(page.getByText(/3547,00/)).toBeVisible();

  await page.getByRole("button", { name: "Usuń Gaja" }).click();
  await expect(page.getByTestId("cart-row")).toHaveCount(1);

  // The cart survives a reload.
  await page.reload();
  await expect(page.getByTestId("cart-row")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Koszyk, 2 produkty" })).toBeVisible();
});

test("empty cart offers a way back to the shop", async ({ page }) => {
  await page.goto("/en/cart");
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse wigs" })).toBeVisible();
});

test("pre-order product has a pre-order button", async ({ page }) => {
  await page.goto("/en/product/lucja");
  await expect(page.getByRole("button", { name: "Pre-order" })).toBeVisible();
});

test("sold-out and coming-soon products cannot be added to the cart", async ({ page }) => {
  for (const slug of ["dalia", "florentyna"]) {
    await page.goto(`/pl/product/${slug}`);
    await expect(page.getByRole("button", { name: /Dodaj do koszyka|Zamów w przedsprzedaży/ })).toHaveCount(0);
  }
});

test("product page suggests related wigs", async ({ page }) => {
  await page.goto("/en/product/bianka");
  const related = page.locator("section", { has: page.getByRole("heading", { name: /You may also/ }) });
  await expect(related.getByRole("article")).toHaveCount(4);
  await expect(related.getByRole("link", { name: "Bianka" })).toHaveCount(0);
});

test("checkout: validation, delivery fees and payment hand-off", async ({ page }) => {
  await page.goto("/pl/product/amelia");
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await page.goto("/pl/cart");
  await expect(page.getByRole("heading", { name: /Uzupełnij swój/ })).toBeVisible();
  await page.getByRole("link", { name: "Przejdź do kasy" }).click();
  await expect(page).toHaveURL(/\/pl\/checkout$/);

  // InPost locker is the default: 1299,00 + 15,99
  await expect(page.getByTestId("checkout-total")).toHaveText(/1314,99/);
  await page.getByLabel(/Kurier/).check();
  await expect(page.getByTestId("checkout-total")).toHaveText(/1318,99/);
  await page.getByLabel(/Odbiór osobisty/).check();
  await expect(page.getByTestId("checkout-total")).toHaveText(/1299,00/);

  // Submitting an empty courier form shows field errors and keeps the customer on the page.
  await page.getByLabel(/Kurier/).check();
  await page.getByRole("button", { name: "Zamawiam i płacę" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Popraw zaznaczone pola");
  await expect(page.getByRole("textbox", { name: "E-mail" })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Wpisz kod pocztowy w formacie 00-000.")).toBeVisible();

  await page.getByRole("textbox", { name: "E-mail" }).fill("anna@example.com");
  await page.getByLabel("Imię i nazwisko").fill("Anna Kowalska");
  await page.getByLabel("Telefon").fill("+48 600 100 200");
  await page.getByLabel("Ulica i numer domu").fill("ul. Długa 5");
  await page.getByLabel("Kod pocztowy").fill("31-147");
  await page.getByLabel("Miejscowość").fill("Kraków");
  await page.getByRole("button", { name: "Zamawiam i płacę" }).click();

  // The test server has no Stripe key, so the server refuses politely and keeps the form filled.
  await expect(page.locator("main").getByRole("alert")).toContainText("Nie udało się rozpocząć płatności");
  await expect(page.getByLabel("Miejscowość")).toHaveValue("Kraków");
});

test("checkout with an empty cart points back to the shop", async ({ page }) => {
  await page.goto("/en/checkout");
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Browse wigs" })).toBeVisible();
});

test("account icon leads to log in when signed out", async ({ page }) => {
  await page.goto("/pl");
  await page.getByRole("link", { name: "Moje konto" }).click();
  await expect(page).toHaveURL(/\/pl\/account\/login$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Witaj");
});

test("create account: checks fields before sending", async ({ page }) => {
  await page.goto("/en/account/register");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Please correct the highlighted fields");
  await expect(page.getByText("Your password must be at least 8 characters.")).toBeVisible();

  await page.getByLabel("Full name").fill("Anna Kowalska");
  await page.getByRole("textbox", { name: "Email" }).fill("anna@example.com");
  await page.getByLabel("Password", { exact: true }).fill("a-long-password");
  await page.getByRole("button", { name: "Show" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");

  // The test server has no Supabase project, so the server answers with a polite error.
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("couldn't reach your account");
  await expect(page.getByLabel("Full name")).toHaveValue("Anna Kowalska");
});

test("log in, forgot password and register pages link to each other", async ({ page }) => {
  await page.goto("/pl/account/login");
  await page.getByRole("link", { name: "Nie pamiętasz hasła?" }).click();
  await expect(page).toHaveURL(/\/pl\/account\/forgot-password$/);
  await page.getByRole("link", { name: "Wróć do logowania" }).click();
  await page.getByRole("link", { name: "Załóż konto" }).click();
  await expect(page).toHaveURL(/\/pl\/account\/register$/);
});

test("an expired email link explains what happened", async ({ page }) => {
  await page.goto("/en/account/login?error=link");
  await expect(page.locator("main").getByRole("alert")).toContainText("This link has expired");
});

test("checkout offers to log in and returns to checkout afterwards", async ({ page }) => {
  await page.goto("/pl/product/helena");
  await page.getByRole("button", { name: "Dodaj do koszyka" }).click();
  await page.goto("/pl/checkout");
  const link = page.getByRole("link", { name: /Zaloguj się, aby uzupełnić/ });
  await expect(link).toHaveAttribute("href", "/pl/account/login?next=%2Fpl%2Fcheckout");
});

test("checkout: buying as a guest is the default, an account is optional", async ({ page }) => {
  await page.goto("/en/product/helena");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/en/checkout");

  await expect(page.getByText("You don't need an account to order.")).toBeVisible();
  const box = page.getByRole("checkbox", { name: /Also create an account/ });
  await expect(box).not.toBeChecked();
  await expect(page.getByLabel("Account password")).toHaveCount(0);

  // Ticking the box asks for a password; a short one is caught before sending.
  await box.check();
  await page.getByRole("textbox", { name: "Email" }).fill("anna@example.com");
  await page.getByLabel("Full name").fill("Anna Kowalska");
  await page.getByLabel("Phone").fill("+48 600 100 200");
  await page.getByLabel(/Personal pickup/).check();
  await page.getByLabel("Account password").fill("short");
  await page.getByRole("button", { name: "Place order and pay" }).click();
  await expect(page.getByText("Your password must be at least 8 characters.")).toBeVisible();

  // Unticking it goes straight on as a guest (the test server has no Stripe key).
  await box.uncheck();
  await page.getByRole("button", { name: "Place order and pay" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("couldn't start the payment");
});

test("menu links to New in and Best sellers", async ({ page }) => {
  await page.goto("/en");
  const nav = page.getByRole("navigation", { name: "Menu" });
  // On phones the menu sits behind the menu button.
  if (!(await nav.first().isVisible())) await page.locator("summary").click();

  await page.getByRole("link", { name: "New in" }).first().click();
  await expect(page).toHaveURL(/\/en\/shop\/new$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("New in");
  await expect(page.getByRole("link", { name: "New in" }).last()).toHaveAttribute("aria-current", "page");

  await page.goto("/pl/shop/bestsellers");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bestsellery");
  // Most sold first: Bianka (51), Amelia (34), Dalia (27)...
  await expect(page.getByRole("article").first()).toContainText("Bianka");
  await expect(page.getByRole("article").nth(1)).toContainText("Amelia");
});
