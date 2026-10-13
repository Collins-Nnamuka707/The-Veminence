import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { safeNextPath } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Target of the links in Supabase emails (confirm sign-up, reset password).
 * Supports both the default link (`?code=`) and the token-hash template (`?token_hash=&type=`).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), `/${routing.defaultLocale}/account`);
  const locale = routing.locales.find((l) => next.startsWith(`/${l}/`)) ?? routing.defaultLocale;
  const failed = NextResponse.redirect(new URL(`/${locale}/account/login?error=link`, origin));

  const supabase = await createSupabaseServerClient();
  if (!supabase) return failed;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Missing code") };

  return error ? failed : NextResponse.redirect(new URL(next, origin));
}
