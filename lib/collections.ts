import { getCardState, type StoreProduct } from "./product-state";

/** Shop collections shown next to the categories in the menu. */
export const COLLECTIONS = ["new", "bestsellers"] as const;
export type Collection = (typeof COLLECTIONS)[number];

export function newIn(products: StoreProduct[]): StoreProduct[] {
  return products.filter((p) => p.isNew);
}

/**
 * Most sold first; coming-soon wigs and wigs that never sold are left out. Before anything has
 * sold (a new shop), it shows the wigs that can be bought now, in catalogue order (newest first),
 * so the page is never empty.
 */
export function bestSellers(products: StoreProduct[], limit?: number): StoreProduct[] {
  let ranked = products
    .filter((p) => p.status !== "coming_soon" && p.salesCount > 0)
    .sort((a, b) => b.salesCount - a.salesCount || a.id.localeCompare(b.id));
  if (ranked.length === 0) ranked = products.filter((p) => getCardState(p).canBuy);
  return limit === undefined ? ranked : ranked.slice(0, limit);
}
