import { describe, expect, it } from "vitest";
import { priceOrder } from "@/lib/checkout";
import { checkoutAccountSchema, checkoutCartSchema, checkoutSchema } from "@/lib/schemas/checkout";
import { fieldErrors } from "@/lib/schemas/errors";
import { buildCheckoutSessionParams } from "@/lib/stripe";
import { product } from "./fixtures";

const fees = { inpost_locker: 1599, courier: 1999, pickup: 0 };
const contact = { locale: "pl", email: "anna@example.com", fullName: "Anna Kowalska", phone: "+48 600 100 200" };

describe("checkoutSchema", () => {
  it("accepts each delivery method with its own fields", () => {
    expect(checkoutSchema.safeParse({ ...contact, deliveryMethod: "inpost_locker", lockerCode: "kra010m" }).data)
      .toMatchObject({ lockerCode: "KRA010M" });
    expect(
      checkoutSchema.safeParse({
        ...contact,
        deliveryMethod: "courier",
        street: "ul. Długa 5",
        apartment: "",
        postcode: "31-147",
        city: "Kraków",
      }).success,
    ).toBe(true);
    expect(checkoutSchema.safeParse({ ...contact, deliveryMethod: "pickup" }).success).toBe(true);
  });

  it("returns error codes per field", () => {
    const result = checkoutSchema.safeParse({
      locale: "pl",
      email: "not-an-email",
      fullName: "",
      phone: "12",
      deliveryMethod: "courier",
      street: "",
      postcode: "31147",
      city: "",
    });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!)).toEqual({
      email: "invalidEmail",
      fullName: "required",
      phone: "invalidPhone",
      street: "required",
      postcode: "invalidPostcode",
      city: "required",
    });
  });

  it("requires a locker code for InPost", () => {
    const result = checkoutSchema.safeParse({ ...contact, deliveryMethod: "inpost_locker", lockerCode: "" });
    expect(fieldErrors(result.error!)).toEqual({ lockerCode: "invalidLocker" });
  });
});

describe("checkoutCartSchema", () => {
  it("parses ids and quantities and rejects empty or broken carts", () => {
    expect(checkoutCartSchema.safeParse('[{"id":"a","quantity":2}]').data).toEqual([{ id: "a", quantity: 2 }]);
    expect(checkoutCartSchema.safeParse("[]").success).toBe(false);
    expect(checkoutCartSchema.safeParse("nope").success).toBe(false);
  });
});

describe("priceOrder", () => {
  const products = [
    product({ id: "a", price: 100000, salePrice: 90000, available: 3 }),
    product({ id: "b", price: 50000, available: 1 }),
  ];

  it("prices from the catalogue and adds the delivery fee", () => {
    const result = priceOrder(
      [
        { id: "a", quantity: 2 },
        { id: "b", quantity: 1 },
      ],
      products,
      "courier",
      fees,
    );
    expect(result).toMatchObject({ ok: true, subtotal: 230000, deliveryFee: 1999, total: 231999 });
  });

  it("fails when an item is unknown or over the available stock", () => {
    expect(priceOrder([{ id: "b", quantity: 2 }], products, "pickup", fees)).toEqual({
      ok: false,
      reason: "unavailable",
      productIds: ["b"],
    });
    expect(priceOrder([{ id: "zzz", quantity: 1 }], products, "pickup", fees)).toMatchObject({
      reason: "unavailable",
    });
    expect(priceOrder([], products, "pickup", fees)).toEqual({ ok: false, reason: "empty" });
  });
});

describe("buildCheckoutSessionParams", () => {
  it("charges the server-side prices in PLN with delivery and keeps delivery details", () => {
    const input = checkoutSchema.parse({
      ...contact,
      deliveryMethod: "inpost_locker",
      lockerCode: "WAW22A",
      notes: "Prosze o kontakt",
    });
    const order = priceOrder([{ id: "a", quantity: 1 }], [product({ id: "a", name: { pl: "Amelia" } })], "inpost_locker", fees);
    if (!order.ok) throw new Error("expected priced order");

    const params = buildCheckoutSessionParams(input, order, {
      siteUrl: new URL("https://veminence.example"),
      deliveryLabel: "Paczkomat InPost",
    });

    expect(params).toMatchObject({
      mode: "payment",
      currency: "pln",
      locale: "pl",
      customer_email: "anna@example.com",
      line_items: [{ quantity: 1, price_data: { unit_amount: 100000, product_data: { name: "Amelia" } } }],
      shipping_options: [{ shipping_rate_data: { fixed_amount: { amount: 1599, currency: "pln" } } }],
      metadata: { delivery_method: "inpost_locker", locker_code: "WAW22A", phone: "+48 600 100 200", items: "ax1" },
      success_url: "https://veminence.example/pl/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://veminence.example/pl/checkout",
    });
  });
});

describe("checkoutAccountSchema (optional account at checkout)", () => {
  it("needs nothing when the box is not ticked", () => {
    expect(checkoutAccountSchema.safeParse({}).data).toEqual({ createAccount: false, accountPassword: "" });
  });

  it("requires a long enough password only when ticked", () => {
    expect(fieldErrors(checkoutAccountSchema.safeParse({ createAccount: "on", accountPassword: "short" }).error!)).toEqual({
      accountPassword: "passwordTooShort",
    });
    expect(checkoutAccountSchema.safeParse({ createAccount: "on", accountPassword: "a-long-password" }).data).toEqual({
      createAccount: true,
      accountPassword: "a-long-password",
    });
  });
});
