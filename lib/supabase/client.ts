"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

/** Browser Supabase client (publishable key only), or null when not configured. */
export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig();
  return config ? createBrowserClient(config.url, config.key) : null;
}
