import type { Category, StoreProduct } from "@/lib/product-state";
import { sampleCategories, sampleProducts } from "./sample-catalog";

// Storefront data access. Pages only call these functions, so swapping the
// sample data for Supabase in Phase 2 does not touch any component.

export async function getCategories(): Promise<Category[]> {
  return sampleCategories;
}

export async function getProducts(): Promise<StoreProduct[]> {
  return sampleProducts;
}

export async function getNewArrivals(limit = 4): Promise<StoreProduct[]> {
  return sampleProducts.filter((p) => p.isNew).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  return sampleProducts.find((p) => p.slug === slug) ?? null;
}
