import type { Grosze } from "./money";
import type { LocalizedText } from "./i18n-content";

export type CategorySlug = "straight" | "wavy" | "curly" | "lace-front";

export type Category = {
  slug: CategorySlug;
  name: LocalizedText;
  description: LocalizedText;
};

/** A product as the storefront sees it. Prices are gross (VAT included). */
export type StoreProduct = {
  id: string;
  slug: string;
  category: CategorySlug;
  name: LocalizedText;
  description: LocalizedText;
  image: { src: string; alt: LocalizedText } | null;
  price: Grosze;
  salePrice: Grosze | null;
  /** Lowest price in the 30 days before the current sale, from price_history (Omnibus). */
  lowestPrice30d: Grosze | null;
  /** stock_on_hand minus active reservations, summed over variants. */
  available: number;
  allowPreorder: boolean;
  status: "published" | "coming_soon";
  isNew: boolean;
  /** Units sold in paid orders; drives "Best sellers". Sample values until orders are stored. */
  salesCount: number;
};

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "preorder" | "coming_soon";

export type CardState = {
  availability: Availability;
  onSale: boolean;
  /** What the customer pays now. */
  currentPrice: Grosze;
  /** Shown struck through when on sale. */
  regularPrice: Grosze;
  /** Omnibus line; only set when on sale. */
  lowestPrice30d: Grosze | null;
  discountPercent: number | null;
  canBuy: boolean;
};

// TODO(admin phase): move to settings so the owner can change it.
export const LOW_STOCK_THRESHOLD = 3;

export function getCardState(product: StoreProduct): CardState {
  const availability = getAvailability(product);
  const onSale =
    availability !== "coming_soon" &&
    product.salePrice !== null &&
    product.salePrice < product.price;
  const currentPrice = onSale ? product.salePrice! : product.price;

  return {
    availability,
    onSale,
    currentPrice,
    regularPrice: product.price,
    lowestPrice30d: onSale ? (product.lowestPrice30d ?? product.price) : null,
    discountPercent: onSale ? Math.round((1 - currentPrice / product.price) * 100) : null,
    canBuy: availability === "in_stock" || availability === "low_stock" || availability === "preorder",
  };
}

function getAvailability(product: StoreProduct): Availability {
  if (product.status === "coming_soon") return "coming_soon";
  if (product.available > LOW_STOCK_THRESHOLD) return "in_stock";
  if (product.available > 0) return "low_stock";
  return product.allowPreorder ? "preorder" : "out_of_stock";
}
