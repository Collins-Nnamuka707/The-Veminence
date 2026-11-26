import type { StoreProduct } from "@/lib/product-state";

export const product = (overrides: Partial<StoreProduct>): StoreProduct => ({
  id: "p",
  slug: "p",
  category: "straight",
  productType: "wig",
  details: { lengthInches: 16, laceSize: "5x5", density: null, colour: null, hairOrigin: null },
  name: { en: "P" },
  description: { en: "" },
  image: null,
  price: 100000,
  salePrice: null,
  lowestPrice30d: null,
  available: 5,
  allowPreorder: false,
  status: "published",
  isNew: false,
  salesCount: 0,
  ...overrides,
  // Tests use the same string for the product and its variant unless they say otherwise.
  variantId: overrides.variantId ?? overrides.id ?? "p",
});
