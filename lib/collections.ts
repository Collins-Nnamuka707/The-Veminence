import type { StoreProduct } from "./product-state";

/** Shop collections shown next to the categories in the menu. */
export const COLLECTIONS = ["new", "bestsellers"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export function newIn(products: StoreProduct[]): StoreProduct[] {
  return products.filter((p) => p.isNew);
}

/** Most sold first. Coming-soon wigs and wigs that never sold are left out. */
export function bestSellers(products: StoreProduct[], limit?: number): StoreProduct[] {
  const ranked = products
    .filter((p) => p.status !== "coming_soon" && p.salesCount > 0)
    .sort((a, b) => b.salesCount - a.salesCount || a.id.localeCompare(b.id));
  return limit === undefined ? ranked : ranked.slice(0, limit);
}
