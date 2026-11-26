import { getCardState, type CategorySlug, type ProductType, type StoreProduct } from "./product-state";

/**
 * Every listing in the shop is a collection at /shop/<key>: product types, textures (the
 * categories table), New in and Best sellers. /shop itself shows everything.
 */
export const TYPE_COLLECTIONS = {
  wigs: ["wig"],
  bundles: ["bundle"],
  "closures-frontals": ["closure", "frontal"],
} as const satisfies Record<string, readonly ProductType[]>;

export type TypeCollection = keyof typeof TYPE_COLLECTIONS;
export type SpecialCollection = "new" | "bestsellers";
export type CollectionKey = TypeCollection | SpecialCollection | CategorySlug;

export const TEXTURES: CategorySlug[] = ["straight", "wavy", "curly", "kinky", "lace-front"];

export function isTypeCollection(key: string): key is TypeCollection {
  return key in TYPE_COLLECTIONS;
}

export function isTexture(key: string): key is CategorySlug {
  return (TEXTURES as string[]).includes(key);
}

export function isCollectionKey(key: string): key is CollectionKey {
  return isTypeCollection(key) || isTexture(key) || key === "new" || key === "bestsellers";
}

export const ALL_COLLECTION_KEYS: CollectionKey[] = [
  ...(Object.keys(TYPE_COLLECTIONS) as TypeCollection[]),
  ...TEXTURES,
  "new",
  "bestsellers",
];

/** Products in a collection, in catalogue order (newest first) or ranked for Best sellers. */
export function collectionProducts(key: CollectionKey, products: StoreProduct[]): StoreProduct[] {
  if (key === "new") return newIn(products);
  if (key === "bestsellers") return bestSellers(products);
  if (isTypeCollection(key)) {
    const types: readonly ProductType[] = TYPE_COLLECTIONS[key];
    return products.filter((p) => types.includes(p.productType));
  }
  return products.filter((p) => p.category === key);
}

export function newIn(products: StoreProduct[]): StoreProduct[] {
  return products.filter((p) => p.isNew);
}

/**
 * Most sold first; coming-soon products and products that never sold are left out. Before
 * anything has sold (a new shop), it shows what can be bought now, in catalogue order, so the
 * page is never empty.
 */
export function bestSellers(products: StoreProduct[], limit?: number): StoreProduct[] {
  let ranked = products
    .filter((p) => p.status !== "coming_soon" && p.salesCount > 0)
    .sort((a, b) => b.salesCount - a.salesCount || a.id.localeCompare(b.id));
  if (ranked.length === 0) ranked = products.filter((p) => getCardState(p).canBuy);
  return limit === undefined ? ranked : ranked.slice(0, limit);
}
