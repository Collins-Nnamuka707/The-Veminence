import type { Grosze } from "./money";
import { getCardState, type StoreProduct } from "./product-state";
import { cartSchema, MAX_CART_LINES, MAX_LINE_QUANTITY, type CartLine } from "./schemas/cart";

export type { CartLine };

/** Pre-orders have no stock limit, so cap them to keep orders sensible. */
export const MAX_PREORDER_QUANTITY = 5;

/** How many of a product one cart may hold; 0 when it cannot be bought. */
export function maxQuantity(product: StoreProduct): number {
  const state = getCardState(product);
  if (!state.canBuy) return 0;
  if (state.availability === "preorder") return MAX_PREORDER_QUANTITY;
  return Math.min(product.available, MAX_LINE_QUANTITY);
}

export function addToCart(lines: CartLine[], id: string, quantity = 1): CartLine[] {
  const existing = lines.find((line) => line.id === id);
  if (existing) return setQuantity(lines, id, existing.quantity + quantity);
  if (lines.length >= MAX_CART_LINES) return lines;
  return [...lines, { id, quantity: clamp(quantity) }];
}

export function setQuantity(lines: CartLine[], id: string, quantity: number): CartLine[] {
  if (quantity < 1) return removeFromCart(lines, id);
  return lines.map((line) => (line.id === id ? { ...line, quantity: clamp(quantity) } : line));
}

export function removeFromCart(lines: CartLine[], id: string): CartLine[] {
  return lines.filter((line) => line.id !== id);
}

export function countItems(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Reads a stored cart; anything malformed becomes an empty cart. */
export function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = cartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export type CartRow = {
  product: StoreProduct;
  quantity: number;
  max: number;
  unitPrice: Grosze;
  lineTotal: Grosze;
  available: boolean;
};

/**
 * Joins cart lines with the catalogue for display. Unknown ids are dropped; quantities above
 * what is available are capped. The total is a preview: checkout recomputes it on the server.
 */
export function resolveCart(
  lines: CartLine[],
  products: StoreProduct[],
): { rows: CartRow[]; subtotal: Grosze } {
  const byId = new Map(products.map((p) => [p.id, p]));
  const rows: CartRow[] = [];

  for (const line of lines) {
    const product = byId.get(line.id);
    if (!product) continue;
    const max = maxQuantity(product);
    const quantity = max > 0 ? Math.min(line.quantity, max) : line.quantity;
    const unitPrice = getCardState(product).currentPrice;
    rows.push({
      product,
      quantity,
      max,
      unitPrice,
      lineTotal: max > 0 ? unitPrice * quantity : 0,
      available: max > 0,
    });
  }

  return { rows, subtotal: rows.reduce((sum, row) => sum + row.lineTotal, 0) };
}

function clamp(quantity: number): number {
  return Math.max(1, Math.min(Math.trunc(quantity), MAX_LINE_QUANTITY));
}
