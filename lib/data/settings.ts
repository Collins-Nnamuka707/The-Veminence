import { cacheLife, cacheTag } from "next/cache";
import type { Grosze } from "@/lib/money";
import type { DeliveryMethod } from "@/lib/schemas/checkout";
import { whatsappNumberSchema } from "@/lib/schemas/settings";
import { canUseSampleData, createPublicSupabaseClient } from "@/lib/supabase/public";

export type StoreSettings = {
  /** Contact number for the footer WhatsApp link. */
  whatsappNumber: string;
  /** Delivery fee per method, in grosze. */
  deliveryFees: Record<DeliveryMethod, Grosze>;
  /** Products with this many or fewer left show "Only N left". */
  lowStockThreshold: number;
};

/** Cache tag for settings; the admin settings page calls revalidateTag(SETTINGS_TAG). */
export const SETTINGS_TAG = "settings";

// Used only by tests and local development without Supabase (see canUseSampleData).
const SAMPLE_SETTINGS = {
  whatsapp_number: "",
  fee_inpost_locker: 1599,
  fee_courier: 1999,
  fee_pickup: 0,
  low_stock_threshold: 3,
};

/** Shop settings from the `settings` table, cached until the admin changes them. */
export async function getStoreSettings(): Promise<StoreSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(SETTINGS_TAG);

  let row = SAMPLE_SETTINGS;
  const supabase = createPublicSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("settings")
      .select("whatsapp_number, fee_inpost_locker, fee_courier, fee_pickup, low_stock_threshold")
      .single();
    if (error) throw new Error(`Could not load settings: ${error.message}`);
    row = data;
  } else if (!canUseSampleData()) {
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and the publishable key.");
  }

  // The number set in the admin wins; WHATSAPP_NUMBER in .env.local covers the time before that.
  const number = whatsappNumberSchema.safeParse(row.whatsapp_number || process.env.WHATSAPP_NUMBER || "");
  if (!number.success) {
    throw new Error(
      `The WhatsApp contact number is missing or invalid (${number.error.issues[0]?.message}). ` +
        "Set it in the admin settings or as WHATSAPP_NUMBER in .env.local.",
    );
  }

  return {
    whatsappNumber: number.data,
    deliveryFees: { inpost_locker: row.fee_inpost_locker, courier: row.fee_courier, pickup: row.fee_pickup },
    lowStockThreshold: row.low_stock_threshold,
  };
}
