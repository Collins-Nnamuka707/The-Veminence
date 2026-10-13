import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getSupabaseConfig } from "./lib/supabase/config";

const intl = createMiddleware(routing);

// Storefront locale routing, plus a refresh of the customer's Supabase session so that
// expired login cookies are renewed before pages render. Admin auth checks join here later.
export default async function proxy(request: NextRequest) {
  const response = intl(request);

  const config = getSupabaseConfig();
  const hasSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (!config || !hasSession) return response;

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Skip admin (English only), API routes, email-link handling (/auth), Next internals and files.
  matcher: ["/((?!admin|api|auth|_next|_vercel|.*\\..*).*)"],
};
