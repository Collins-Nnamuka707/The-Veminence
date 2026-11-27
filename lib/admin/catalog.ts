import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  productType: string;
  lengthInches: number | null;
  /** Storage path of the main photo, if any. */
  imagePath: string | null;
  photoCount: number;
  status: "draft" | "published" | "coming_soon" | "archived";
  isNew: boolean;
  allowPreorder: boolean;
  variants: AdminVariant[];
};

export type AdminVariant = {
  id: string;
  label: string;
  sku: string | null;
  price: number;
  salePrice: number | null;
  stockOnHand: number;
  isActive: boolean;
};

/** Every product, drafts and archived included (admins see all through row-level security). */
export async function listAdminProducts(): Promise<AdminProduct[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name_en, product_type, length_inches, status, is_new, allow_preorder, categories(name_en), variants(id, label_en, sku, price, sale_price, stock_on_hand, is_active, position), product_images(storage_path, position)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load products: ${error.message}`);

  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name_en,
    category: p.categories?.name_en ?? "",
    productType: p.product_type,
    lengthInches: p.length_inches,
    imagePath: [...p.product_images].sort((a, b) => a.position - b.position)[0]?.storage_path ?? null,
    photoCount: p.product_images.length,
    status: p.status as AdminProduct["status"],
    isNew: p.is_new,
    allowPreorder: p.allow_preorder,
    variants: [...p.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({
        id: v.id,
        label: v.label_en,
        sku: v.sku,
        price: v.price,
        salePrice: v.sale_price,
        stockOnHand: v.stock_on_hand,
        isActive: v.is_active,
      })),
  }));
}

export type AdminProductDetail = {
  id: string;
  slug: string;
  categoryId: string;
  productType: string;
  lengthInches: number | null;
  laceSize: string;
  density: string;
  colour: string;
  hairOrigin: string;
  nameEn: string;
  namePl: string;
  descriptionEn: string;
  descriptionPl: string;
  status: AdminProduct["status"];
  isNew: boolean;
  allowPreorder: boolean;
  variant: AdminVariant | null;
  images: { id: string; storagePath: string; altEn: string }[];
};

/** One product with its first variant and photos, for the edit page. */
export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, category_id, product_type, length_inches, lace_size, density, colour, hair_origin, name_en, name_pl, description_en, description_pl, status, is_new, allow_preorder, variants(id, label_en, sku, price, sale_price, stock_on_hand, is_active, position), product_images(id, storage_path, alt_en, position)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load the product: ${error.message}`);
  if (!data) return null;

  const variant = [...data.variants].sort((a, b) => a.position - b.position)[0];
  return {
    id: data.id,
    slug: data.slug,
    categoryId: data.category_id,
    productType: data.product_type,
    lengthInches: data.length_inches,
    laceSize: data.lace_size ?? "",
    density: data.density ?? "",
    colour: data.colour ?? "",
    hairOrigin: data.hair_origin ?? "",
    nameEn: data.name_en,
    namePl: data.name_pl ?? "",
    descriptionEn: data.description_en,
    descriptionPl: data.description_pl ?? "",
    status: data.status as AdminProduct["status"],
    isNew: data.is_new,
    allowPreorder: data.allow_preorder,
    variant: variant
      ? {
          id: variant.id,
          label: variant.label_en,
          sku: variant.sku,
          price: variant.price,
          salePrice: variant.sale_price,
          stockOnHand: variant.stock_on_hand,
          isActive: variant.is_active,
        }
      : null,
    images: [...data.product_images]
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ id: i.id, storagePath: i.storage_path, altEn: i.alt_en })),
  };
}

export async function listAdminCategories(): Promise<{ id: string; name: string }[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("categories").select("id, name_en").order("position");
  if (error) throw new Error(`Could not load categories: ${error.message}`);
  return data.map((c) => ({ id: c.id, name: c.name_en }));
}

export type StockMovementRow = {
  id: number;
  at: string;
  product: string;
  change: number;
  reason: string;
  note: string;
};

/** The latest stock changes, newest first. */
export async function listRecentStockMovements(limit = 20): Promise<StockMovementRow[]> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("stock_movements")
    .select("id, created_at, change, reason, note, variants(products(name_en))")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not load stock movements: ${error.message}`);
  return data.map((m) => ({
    id: m.id,
    at: m.created_at,
    product: m.variants?.products?.name_en ?? "",
    change: m.change,
    reason: m.reason,
    note: m.note,
  }));
}
