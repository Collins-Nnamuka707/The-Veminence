import { getCardState, type StoreProduct } from "./product-state";

/** Wigs to suggest next to one product: same style first, then ones that can be bought now. */
export function getRelatedProducts(product: StoreProduct, all: StoreProduct[], limit = 4): StoreProduct[] {
  return rank(all.filter((p) => p.id !== product.id), new Set([product.category]), product.price, limit);
}

/** Wigs to suggest in the cart, based on the styles already in it. */
export function getCartSuggestions(cartIds: string[], all: StoreProduct[], limit = 4): StoreProduct[] {
  const inCart = all.filter((p) => cartIds.includes(p.id));
  const categories = new Set(inCart.map((p) => p.category));
  const averagePrice = inCart.length
    ? inCart.reduce((sum, p) => sum + p.price, 0) / inCart.length
    : 0;
  // Suggestions in the cart must be buyable right away.
  const candidates = all.filter((p) => !cartIds.includes(p.id) && getCardState(p).canBuy);
  return rank(candidates, categories, averagePrice, limit);
}

function rank(
  candidates: StoreProduct[],
  categories: Set<string>,
  referencePrice: number,
  limit: number,
): StoreProduct[] {
  const score = (p: StoreProduct) =>
    (categories.has(p.category) ? 2 : 0) + (getCardState(p).canBuy ? 1 : 0);

  return [...candidates]
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        Math.abs(a.price - referencePrice) - Math.abs(b.price - referencePrice) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}
