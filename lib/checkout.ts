import { maxQuantity, type CartLine } from "./cart";
import type { Grosze } from "./money";
import { getCardState, type StoreProduct } from "./product-state";
import type { DeliveryMethod } from "./schemas/checkout";

export type PricedItem = {
  product: StoreProduct;
  quantity: number;
  unitPrice: Grosze;
  lineTotal: Grosze;
};

export type PricedOrder = {
  items: PricedItem[];
  subtotal: Grosze;
  deliveryFee: Grosze;
  total: Grosze;
};

export type PricingResult =
  | ({ ok: true } & PricedOrder)
  | { ok: false; reason: "empty" }
  | { ok: false; reason: "unavailable"; productIds: string[] };

/**
 * Server-side pricing of a checkout. Prices come from the catalogue, never from the browser.
 * Any line that cannot be bought in the requested quantity fails the whole checkout, so the
 * customer never pays for something different from what they saw.
 */
export function priceOrder(
  lines: CartLine[],
  products: StoreProduct[],
  deliveryMethod: DeliveryMethod,
  deliveryFees: Record<DeliveryMethod, Grosze>,
): PricingResult {
  if (lines.length === 0) return { ok: false, reason: "empty" };

  const byId = new Map(products.map((p) => [p.id, p]));
  const items: PricedItem[] = [];
  const unavailable: string[] = [];

  for (const line of lines) {
    const product = byId.get(line.id);
    if (!product || line.quantity > maxQuantity(product)) {
      unavailable.push(line.id);
      continue;
    }
    const unitPrice = getCardState(product).currentPrice;
    items.push({ product, quantity: line.quantity, unitPrice, lineTotal: unitPrice * line.quantity });
  }

  if (unavailable.length > 0) return { ok: false, reason: "unavailable", productIds: unavailable };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = deliveryFees[deliveryMethod];
  return { ok: true, items, subtotal, deliveryFee, total: subtotal + deliveryFee };
}
