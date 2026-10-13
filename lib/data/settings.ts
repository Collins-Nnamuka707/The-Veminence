import type { Grosze } from "@/lib/money";
import type { DeliveryMethod } from "@/lib/schemas/checkout";
import { whatsappNumberSchema } from "@/lib/schemas/settings";

export type StoreSettings = {
  /** Contact number for the footer WhatsApp link. */
  whatsappNumber: string;
  /** Delivery fee per method, in grosze. */
  deliveryFees: Record<DeliveryMethod, Grosze>;
};

// For now these come from environment variables and the values below.
// They move to the `settings` table (editable in the admin) with the database.
export function getStoreSettings(): StoreSettings {
  const parsed = whatsappNumberSchema.safeParse(process.env.WHATSAPP_NUMBER ?? "");
  if (!parsed.success) {
    throw new Error(
      `WHATSAPP_NUMBER is missing or invalid (${parsed.error.issues[0]?.message}). ` +
        "Set it in .env.local, e.g. WHATSAPP_NUMBER=+48600100200",
    );
  }

  return {
    whatsappNumber: parsed.data,
    // PLACEHOLDER fees until the owner confirms them (docs/TODO.md).
    deliveryFees: { inpost_locker: 1599, courier: 1999, pickup: 0 },
  };
}
