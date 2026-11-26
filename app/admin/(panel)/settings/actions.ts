"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { SETTINGS_TAG } from "@/lib/data/settings";
import { fieldErrors } from "@/lib/schemas/errors";
import { settingsFormSchema } from "@/lib/schemas/settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SettingsFormState = { error?: string; fieldErrors?: Record<string, string>; saved?: boolean };

/** Saves delivery fees and shop details. Only the owner may (row-level security checks it too). */
export async function updateSettings(_prev: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") return { error: "Only the shop owner can change settings." };

  const parsed = settingsFormSchema.safeParse({
    feeInpostLocker: formData.get("feeInpostLocker") ?? "",
    feeCourier: formData.get("feeCourier") ?? "",
    feePickup: formData.get("feePickup") ?? "",
    whatsappNumber: formData.get("whatsappNumber") ?? "",
    lowStockThreshold: formData.get("lowStockThreshold") ?? "",
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const input = parsed.data;
  const { data, error } = await supabase
    .from("settings")
    .update({
      fee_inpost_locker: input.feeInpostLocker,
      fee_courier: input.feeCourier,
      fee_pickup: input.feePickup,
      whatsapp_number: input.whatsappNumber,
      low_stock_threshold: input.lowStockThreshold,
    })
    .eq("id", true)
    .select("id");
  if (error || !data?.length) {
    console.error(`Admin: settings save failed (${error?.code}): ${error?.message ?? "no row updated"}`);
    return { error: "The settings could not be saved. Please try again." };
  }

  // The shop reads fees and the contact number through SETTINGS_TAG (checkout, footer).
  updateTag(SETTINGS_TAG);
  return { saved: true };
}
