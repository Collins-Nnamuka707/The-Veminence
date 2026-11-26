"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

/** Browser Supabase client (publishable key only), or null when not configured. */
export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig();
  return config ? createBrowserClient<Database>(config.url, config.key) : null;
}
