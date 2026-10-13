import { describe, expect, it } from "vitest";
import { getCardState, LOW_STOCK_THRESHOLD, type StoreProduct } from "@/lib/product-state";

const base: StoreProduct = {
  id: "p",
  slug: "p",
  category: "straight",
  name: { pl: "P" },
  description: { pl: "" },
  image: null,
  price: 100000,
  salePrice: null,
  lowestPrice30d: null,
  available: 10,
  allowPreorder: false,
  status: "published",
  isNew: false,
  salesCount: 0,
};

const state = (overrides: Partial<StoreProduct>) => getCardState({ ...base, ...overrides });

describe("getCardState availability", () => {
  it("in stock above the low-stock threshold", () => {
    expect(state({ available: LOW_STOCK_THRESHOLD + 1 }).availability).toBe("in_stock");
  });

  it("low stock at or below the threshold", () => {
    expect(state({ available: LOW_STOCK_THRESHOLD }).availability).toBe("low_stock");
    expect(state({ available: 1 }).availability).toBe("low_stock");
  });

  it("out of stock at zero without pre-order", () => {
    const s = state({ available: 0 });
    expect(s.availability).toBe("out_of_stock");
    expect(s.canBuy).toBe(false);
  });

  it("pre-order at zero when allowed", () => {
    const s = state({ available: 0, allowPreorder: true });
    expect(s.availability).toBe("preorder");
    expect(s.canBuy).toBe(true);
  });

  it("coming soon wins over stock and cannot be bought", () => {
    const s = state({ status: "coming_soon", available: 5, salePrice: 50000 });
    expect(s.availability).toBe("coming_soon");
    expect(s.canBuy).toBe(false);
    expect(s.onSale).toBe(false);
  });
});

describe("getCardState sale and Omnibus", () => {
  it("not on sale without a lower sale price", () => {
    expect(state({ salePrice: 100000 }).onSale).toBe(false);
    expect(state({ salePrice: 120000 }).onSale).toBe(false);
  });

  it("on sale shows sale price, discount and 30-day lowest price", () => {
    const s = state({ salePrice: 80000, lowestPrice30d: 95000 });
    expect(s).toMatchObject({
      onSale: true,
      currentPrice: 80000,
      regularPrice: 100000,
      discountPercent: 20,
      lowestPrice30d: 95000,
    });
  });

  it("falls back to the regular price when there is no price history", () => {
    expect(state({ salePrice: 80000 }).lowestPrice30d).toBe(100000);
  });

  it("no Omnibus line when not on sale", () => {
    expect(state({ lowestPrice30d: 90000 }).lowestPrice30d).toBeNull();
  });
});
