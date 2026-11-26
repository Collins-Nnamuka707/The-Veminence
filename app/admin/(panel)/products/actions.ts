"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import { CATALOG_TAG } from "@/lib/data/catalog";
import { newProductFormSchema, productFormSchema } from "@/lib/schemas/admin";
import { fieldErrors } from "@/lib/schemas/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductFormState = { error?: string; fieldErrors?: Record<string, string>; saved?: boolean };

function formValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()].filter(
      (entry): entry is [string, string] => !entry[0].startsWith("$ACTION_") && typeof entry[1] === "string",
    ),
  );
}

/** Database errors in words the owner can act on. */
function saveError(error: { code?: string; message: string }): string {
  console.error(`Admin: product save failed (${error.code}): ${error.message}`);
  if (error.code === "23505") return "Another product already uses that SKU.";
  if (error.code === "42501") return "Your account isn't allowed to do this.";
  return "The product could not be saved. Please try again.";
}

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = newProductFormSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const input = parsed.data;
  const base = slugify(input.nameEn) || "product";
  const { data: existing } = await supabase.from("products").select("slug").like("slug", `${base}%`);
  const slug = uniqueSlug(base, new Set((existing ?? []).map((row) => row.slug)));

  const { data: productId, error } = await supabase.rpc("admin_create_product", {
    p_slug: slug,
    p_category_id: input.categoryId,
    p_product_type: input.productType,
    p_name_en: input.nameEn,
    p_name_pl: input.namePl,
    p_description_en: input.descriptionEn,
    p_description_pl: input.descriptionPl,
    p_length_inches: input.lengthInches,
    p_lace_size: input.laceSize,
    p_density: input.density,
    p_colour: input.colour,
    p_hair_origin: input.hairOrigin,
    p_status: input.status,
    p_is_new: input.isNew,
    p_allow_preorder: input.allowPreorder,
    p_price: input.price,
    // The generated type marks it required; the function accepts null for "no sale".
    p_sale_price: input.salePrice as number,
    p_sku: input.sku,
    p_initial_stock: input.initialStock,
  });
  if (error || !productId) return { error: saveError(error ?? { message: "no id returned" }) };

  updateTag(CATALOG_TAG);
  redirect(`/admin/products/${productId}?created=1`);
}

export async function updateProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const values = formValues(formData);
  const productId = z.uuid().safeParse(values.productId);
  const parsed = productFormSchema.safeParse(values);
  if (!productId.success) return { error: "Unknown product." };
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const input = parsed.data;
  const { error } = await supabase.rpc("admin_update_product", {
    p_product_id: productId.data,
    p_category_id: input.categoryId,
    p_product_type: input.productType,
    p_name_en: input.nameEn,
    p_name_pl: input.namePl,
    p_description_en: input.descriptionEn,
    p_description_pl: input.descriptionPl,
    p_length_inches: input.lengthInches,
    p_lace_size: input.laceSize,
    p_density: input.density,
    p_colour: input.colour,
    p_hair_origin: input.hairOrigin,
    p_status: input.status,
    p_is_new: input.isNew,
    p_allow_preorder: input.allowPreorder,
    p_price: input.price,
    p_sale_price: input.salePrice as number,
    p_sku: input.sku,
  });
  if (error) return { error: saveError(error) };

  updateTag(CATALOG_TAG);
  return { saved: true };
}

const IMAGE_PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$/;

/**
 * Records a photo the browser has already uploaded to the product-images bucket (only admins may
 * upload there). The path must belong to this product.
 */
export async function addProductImage(productId: string, storagePath: string, altEn: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!z.uuid().safeParse(productId).success || !IMAGE_PATH.test(storagePath) || !storagePath.startsWith(`${productId}/`)) {
    return { error: "That upload doesn't belong to this product." };
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    alt_en: altEn.slice(0, 200),
    position: count ?? 0,
  });
  if (error) return { error: saveError(error) };

  updateTag(CATALOG_TAG);
  return {};
}

export async function removeProductImage(imageId: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!z.uuid().safeParse(imageId).success) return { error: "Unknown photo." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: image } = await supabase.from("product_images").select("storage_path").eq("id", imageId).maybeSingle();
  if (!image) return { error: "That photo no longer exists." };

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { error: saveError(error) };
  await supabase.storage.from("product-images").remove([image.storage_path]);

  updateTag(CATALOG_TAG);
  return {};
}

/**
 * Deletes a product for good: its variants, photos, price history and stock history go with it
 * (the database cascades). Once orders exist, order_items will reference variants with
 * `on delete restrict`, so a product that was ever ordered can't be deleted; the owner archives it
 * instead, which keeps order history intact.
 */
export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!z.uuid().safeParse(productId).success) return { error: "Unknown product." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { data: images } = await supabase.from("product_images").select("storage_path").eq("product_id", productId);

  const { data: deleted, error } = await supabase.from("products").delete().eq("id", productId).select("id");
  if (error) {
    console.error(`Admin: product delete failed (${error.code}): ${error.message}`);
    if (error.code === "23503") {
      return { error: "This product is part of customer orders, so it can't be deleted. Set it to Archived to hide it instead." };
    }
    if (error.code === "42501") return { error: "Your account isn't allowed to do this." };
    return { error: "The product could not be deleted. Please try again." };
  }
  if (!deleted?.length) return { error: "That product no longer exists." };

  // The photo files are only removed once the product is gone, so a failed delete keeps them.
  const paths = (images ?? []).map((image) => image.storage_path);
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from("product-images").remove(paths);
    if (storageError) console.error(`Admin: photo files left after delete: ${storageError.message}`);
  }

  updateTag(CATALOG_TAG);
  redirect("/admin/products?deleted=1");
}
