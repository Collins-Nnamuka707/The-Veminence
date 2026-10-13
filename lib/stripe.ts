import Stripe from "stripe";
import type { PricedOrder } from "./checkout";
import { t } from "./i18n-content";
import type { CheckoutInput } from "./schemas/checkout";

/** Server only: returns null when STRIPE_SECRET_KEY is not configured. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

/** Stripe metadata values are limited to 500 characters. */
const meta = (value: string) => value.slice(0, 500);

/**
 * Parameters for a Stripe Checkout Session. Amounts come from the server-side priced order.
 * Delivery details travel as metadata so every payment in the Stripe dashboard shows where
 * to send the parcel (until orders are stored in the database).
 */
export function buildCheckoutSessionParams(
  input: CheckoutInput,
  order: PricedOrder,
  options: { siteUrl: URL; deliveryLabel: string; customerId?: string },
): Stripe.Checkout.SessionCreateParams {
  const { locale } = input;
  const delivery: Record<string, string> =
    input.deliveryMethod === "inpost_locker"
      ? { locker_code: input.lockerCode }
      : input.deliveryMethod === "courier"
        ? {
            address: [input.street, input.apartment].filter(Boolean).join(" / "),
            postcode: input.postcode,
            city: input.city,
          }
        : {};

  const metadata: Record<string, string> = {
    full_name: meta(input.fullName),
    phone: meta(input.phone),
    delivery_method: input.deliveryMethod,
    ...Object.fromEntries(Object.entries(delivery).map(([k, v]) => [k, meta(v)])),
    items: meta(order.items.map((item) => `${item.product.id}x${item.quantity}`).join(",")),
    ...(input.notes ? { notes: meta(input.notes) } : {}),
    ...(options.customerId ? { customer_id: options.customerId } : {}),
  };

  return {
    mode: "payment",
    ui_mode: "hosted_page",
    locale,
    currency: "pln",
    customer_email: input.email,
    submit_type: "pay",
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "pln",
        unit_amount: item.unitPrice,
        product_data: {
          name: t(item.product.name, locale),
          metadata: { product_id: item.product.id },
        },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: options.deliveryLabel,
          fixed_amount: { amount: order.deliveryFee, currency: "pln" },
        },
      },
    ],
    metadata,
    payment_intent_data: { metadata },
    // Stripe replaces {CHECKOUT_SESSION_ID} itself.
    success_url: `${options.siteUrl.origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${options.siteUrl.origin}/${locale}/checkout`,
  };
}
