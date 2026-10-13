import { formatPrice, type Grosze } from "./money";

export type WhatsAppOrderItem = {
  name: string;
  variant: string;
  quantity: number;
};

export type WhatsAppOrder = {
  reference: string;
  items: WhatsAppOrderItem[];
  delivery: string;
  total: Grosze;
  name: string;
};

/** Long links fail on some phones, so only the first few items are listed. */
export const MAX_ITEMS_IN_MESSAGE = 5;

/**
 * Builds a wa.me link from the owner's template (stored in `settings`, one per language).
 * Placeholders: {reference} {items} {delivery} {total} {name}
 */
export function buildWhatsAppLink(phone: string, template: string, order: WhatsAppOrder): string {
  const listed = order.items.slice(0, MAX_ITEMS_IN_MESSAGE).map(
    (item) => `${item.quantity}× ${item.name} (${item.variant})`,
  );
  const hidden = order.items.length - listed.length;
  if (hidden > 0) listed.push(`+${hidden}…`);

  const values: Record<string, string> = {
    reference: order.reference,
    items: listed.join("\n"),
    delivery: order.delivery,
    total: formatPrice(order.total),
    name: order.name,
  };

  return toWaMe(phone, fillTemplate(template, values));
}

/** A plain chat link with no prefilled message (e.g. "contact us"). */
export function buildWhatsAppChatLink(phone: string): string {
  return `https://wa.me/${normalizePhone(phone)}`;
}

function toWaMe(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

function normalizePhone(phone: string): string {
  const number = phone.replace(/\D/g, "").replace(/^00/, "");
  if (number.length < 8) {
    throw new Error("WhatsApp number must be in international format, e.g. +48 600 000 000");
  }
  return number;
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
