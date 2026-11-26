import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

/**
 * Cookie-free Supabase client with the publishable key, for public data inside "use cache"
 * functions (catalogue, settings). Row-level security limits it to what any visitor may see.
 * Returns null when Supabase is not configured.
 */
export function createPublicSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient<Database>(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Public URL of a file in the product-images bucket. */
export function productImageUrl(storagePath: string): string {
  const config = getSupabaseConfig();
  return `${config?.url ?? ""}/storage/v1/object/public/product-images/${storagePath}`;
}

/**
 * Sample data stands in for Supabase only in tests (CATALOG_SOURCE=sample) and in local
 * development without keys. A production build without Supabase fails loudly instead.
 */
export function canUseSampleData(): boolean {
  return process.env.CATALOG_SOURCE === "sample" || process.env.NODE_ENV !== "production";
}
