"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { STOCK_ACTIONS, stockAdjustSchema } from "@/lib/schemas/admin";
import { fieldErrors } from "@/lib/schemas/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StockFormState = { error?: string; fieldErrors?: Record<string, string>; newLevel?: number };

export async function adjustStock(_prev: StockFormState, formData: FormData): Promise<StockFormState> {
  await requireAdmin();
  const parsed = stockAdjustSchema.safeParse({
    variantId: formData.get("variantId"),
    action: formData.get("action"),
    quantity: formData.get("quantity"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { variantId, action, quantity, note } = parsed.data;
  const { mode, reason } = STOCK_ACTIONS[action];
  if (mode !== "set" && quantity === 0) return { fieldErrors: { quantity: "Enter at least 1." } };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: newLevel, error } = await supabase.rpc("admin_adjust_stock", {
    p_variant_id: variantId,
    p_mode: mode,
    p_quantity: quantity,
    p_reason: reason,
    p_note: note,
  });
  if (error) {
    console.error(`Admin: stock change failed (${error.code}): ${error.message}`);
    if (error.code === "23514") return { fieldErrors: { quantity: "You can't remove more than you have in stock." } };
    return { error: "The stock change could not be saved. Please try again." };
  }

  updateTag(CATALOG_TAG);
  return { newLevel: newLevel ?? undefined };
}
