import type { StoreProduct } from "@/lib/product-state";

export const product = (overrides: Partial<StoreProduct>): StoreProduct => ({
  id: "p",
  slug: "p",
  category: "straight",
  name: { pl: "P" },
  description: { pl: "" },
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
});
