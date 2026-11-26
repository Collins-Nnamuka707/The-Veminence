import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getSupabaseConfig } from "./lib/supabase/config";
import type { Database } from "./lib/supabase/database.types";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) return adminProxy(request);
  return storefrontProxy(request);
}

// Storefront: locale routing, plus a refresh of the customer's Supabase session so that expired
// login cookies are renewed before pages render (only when a session cookie exists).
async function storefrontProxy(request: NextRequest) {
  const response = intl(request);
  const hasSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (!hasSession) return response;

  const supabase = sessionClient(request, response);
  if (supabase) await supabase.auth.getClaims();
  return response;
}

// Admin: English only (no locale routing). Every /admin page except the login requires an admin
// role. Server actions and pages check again with requireAdmin() (lib/admin/auth.ts).
async function adminProxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === "/admin/login";
  const response = NextResponse.next();
  const supabase = sessionClient(request, response);

  let isAdmin = false;
  if (supabase) {
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;
    if (userId) {
      const { data: role } = await supabase.from("admin_users").select("role").eq("user_id", userId).maybeSingle();
      isAdmin = Boolean(role);
    }
  }

  if (isLogin) return isAdmin ? redirectKeepingCookies(request, response, "/admin") : response;
  if (!isAdmin) return redirectKeepingCookies(request, response, "/admin/login");
  return response;
}

/** Supabase client that reads cookies from the request and writes refreshed ones to `response`. */
function sessionClient(request: NextRequest, response: NextResponse) {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });
}

function redirectKeepingCookies(request: NextRequest, from: NextResponse, path: string) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  // Skip API routes, email-link handling (/auth), Next internals and files.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
