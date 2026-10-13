import { describe, expect, it } from "vitest";
import {
  addToCart,
  countItems,
  MAX_PREORDER_QUANTITY,
  maxQuantity,
  parseCart,
  removeFromCart,
  resolveCart,
  setQuantity,
} from "@/lib/cart";
import { MAX_CART_LINES } from "@/lib/schemas/cart";
import { product } from "./fixtures";

describe("cart lines", () => {
  it("adds, merges, changes and removes lines", () => {
    let lines = addToCart([], "a");
    lines = addToCart(lines, "a", 2);
    lines = addToCart(lines, "b");
    expect(lines).toEqual([
      { id: "a", quantity: 3 },
      { id: "b", quantity: 1 },
    ]);
    expect(countItems(lines)).toBe(4);
    expect(setQuantity(lines, "a", 0)).toEqual([{ id: "b", quantity: 1 }]);
    expect(removeFromCart(lines, "b")).toEqual([{ id: "a", quantity: 3 }]);
  });

  it("caps the number of different lines", () => {
    const full = Array.from({ length: MAX_CART_LINES }, (_, i) => ({ id: `p${i}`, quantity: 1 }));
    expect(addToCart(full, "extra")).toHaveLength(MAX_CART_LINES);
  });
});

describe("parseCart", () => {
  it("reads a valid stored cart", () => {
    expect(parseCart('[{"id":"a","quantity":2}]')).toEqual([{ id: "a", quantity: 2 }]);
  });

  it("ignores missing, broken or tampered data", () => {
    expect(parseCart(null)).toEqual([]);
    expect(parseCart("{not json")).toEqual([]);
    expect(parseCart('[{"id":"a","quantity":-1}]')).toEqual([]);
    expect(parseCart('[{"id":"a","quantity":1,"price":1}]')).toEqual([{ id: "a", quantity: 1 }]);
  });
});

describe("maxQuantity", () => {
  it("follows stock, the pre-order cap, or zero when not for sale", () => {
    expect(maxQuantity(product({ available: 4 }))).toBe(4);
    expect(maxQuantity(product({ available: 0, allowPreorder: true }))).toBe(MAX_PREORDER_QUANTITY);
    expect(maxQuantity(product({ available: 0 }))).toBe(0);
    expect(maxQuantity(product({ status: "coming_soon" }))).toBe(0);
  });
});

describe("resolveCart", () => {
  it("prices lines at the current (sale) price and caps quantities to stock", () => {
    const products = [
      product({ id: "sale", price: 100000, salePrice: 80000, available: 2 }),
      product({ id: "full", price: 50000 }),
    ];
    const { rows, subtotal } = resolveCart(
      [
        { id: "sale", quantity: 5 },
        { id: "full", quantity: 1 },
      ],
      products,
    );
    expect(rows.map((r) => [r.product.id, r.quantity, r.lineTotal])).toEqual([
      ["sale", 2, 160000],
      ["full", 1, 50000],
    ]);
    expect(subtotal).toBe(210000);
  });

  it("drops unknown products and excludes sold-out ones from the total", () => {
    const { rows, subtotal } = resolveCart(
      [
        { id: "gone", quantity: 1 },
        { id: "soldout", quantity: 1 },
      ],
      [product({ id: "soldout", available: 0 })],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ available: false, lineTotal: 0 });
    expect(subtotal).toBe(0);
  });
});
