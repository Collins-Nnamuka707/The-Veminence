import { cacheLife, cacheTag } from "next/cache";
import { bestSellers, newIn } from "@/lib/collections";
import type { Category, CategorySlug, ProductType, StoreProduct } from "@/lib/product-state";
import { canUseSampleData, createPublicSupabaseClient, productImageUrl } from "@/lib/supabase/public";
import { sampleCategories, sampleProducts } from "./sample-catalog";

/** Cache tag for everything below; admin changes call revalidateTag(CATALOG_TAG). */
export const CATALOG_TAG = "catalog";

type Catalog = { categories: Category[]; products: StoreProduct[] };

/** The whole visible catalogue, read once and cached (up to an hour, or until the admin changes it). */
async function loadCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    if (canUseSampleData()) return { categories: sampleCategories, products: sampleProducts };
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and the publishable key.");
  }

  const [categories, products, variants, images] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name_en, name_pl, description_en, description_pl")
      .order("position"),
    supabase
      .from("products")
      .select(
        "id, slug, category_id, product_type, name_en, name_pl, description_en, description_pl, length_inches, lace_size, density, colour, hair_origin, status, is_new, allow_preorder",
      )
      .order("created_at", { ascending: false }),
    // Visible products only (row-level security), active variants only (view).
    supabase.from("catalog_variants").select("*").order("position"),
    supabase.from("product_images").select("product_id, storage_path, alt_en, alt_pl").order("position"),
  ]);
  for (const result of [categories, products, variants, images]) {
    if (result.error) throw new Error(`Could not load the catalogue: ${result.error.message}`);
  }

  const categorySlug = new Map(categories.data!.map((c) => [c.id, c.slug as CategorySlug]));

  return {
    categories: categories.data!.map((c) => ({
      slug: c.slug as CategorySlug,
      name: { en: c.name_en, pl: c.name_pl },
      description: { en: c.description_en, pl: c.description_pl },
    })),
    products: products.data!.flatMap((p): StoreProduct[] => {
      // The first active variant is what the product page sells for now.
      const variant = variants.data!.find((v) => v.product_id === p.id);
      if (!variant?.variant_id || variant.price === null) return [];
      const image = images.data!.find((i) => i.product_id === p.id);
      return [
        {
          id: p.id,
          variantId: variant.variant_id,
          slug: p.slug,
          category: categorySlug.get(p.category_id) ?? "straight",
          productType: p.product_type as ProductType,
          details: {
            lengthInches: p.length_inches,
            laceSize: p.lace_size,
            density: p.density,
            colour: p.colour,
            hairOrigin: p.hair_origin,
          },
          name: { en: p.name_en, pl: p.name_pl },
          description: { en: p.description_en, pl: p.description_pl },
          image: image
            ? { src: productImageUrl(image.storage_path), alt: { en: image.alt_en, pl: image.alt_pl } }
            : null,
          price: variant.price,
          salePrice: variant.sale_price,
          lowestPrice30d: variant.lowest_price_30d,
          available: variant.available ?? 0,
          allowPreorder: p.allow_preorder,
          status: p.status === "coming_soon" ? "coming_soon" : "published",
          isNew: p.is_new,
          // Best sellers count paid orders once orders are stored (step 4).
          salesCount: 0,
        },
      ];
    }),
  };
}

export async function getCategories(): Promise<Category[]> {
  return (await loadCatalog()).categories;
}

export async function getProducts(): Promise<StoreProduct[]> {
  return (await loadCatalog()).products;
}

export async function getNewArrivals(limit?: number): Promise<StoreProduct[]> {
  return newIn(await getProducts()).slice(0, limit);
}

export async function getBestSellers(limit?: number): Promise<StoreProduct[]> {
  return bestSellers(await getProducts(), limit);
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}
