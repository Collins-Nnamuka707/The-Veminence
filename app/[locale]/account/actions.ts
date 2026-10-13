"use server";

import { redirect } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { safeNextPath } from "@/lib/auth";
import { fieldErrors } from "@/lib/schemas/errors";
import {
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/schemas/auth";
import { siteUrl } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthFormError =
  | "invalidCredentials"
  | "emailNotConfirmed"
  | "weakPassword"
  | "samePassword"
  | "linkExpired"
  | "tooManyAttempts"
  | "authUnavailable"
  | "generic";

export type AuthState =
  | { status: "idle" }
  | { status: "done" }
  | { status: "error"; fieldErrors?: Record<string, string>; formError?: AuthFormError };

// Root params are not available in server actions, so every form sends its locale.
const formValues = (formData: FormData) =>
  Object.fromEntries([...formData.entries()].filter(([key]) => !key.startsWith("$ACTION_")));

const emailLink = (next: string) =>
  `${siteUrl.origin}/auth/confirm?next=${encodeURIComponent(next)}`;

function authError(error: { code?: string; status?: number }): AuthFormError {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "weak_password":
      return "weakPassword";
    case "same_password":
      return "samePassword";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "tooManyAttempts";
    default:
      return error.status === 429 ? "tooManyAttempts" : "generic";
  }
}

const unavailable: AuthState = { status: "error", formError: "authUnavailable" };

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = formValues(formData);
  if (values.website) return { status: "error", formError: "generic" }; // honeypot
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;

  const { locale, fullName, email, password } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: emailLink(`/${locale}/account`),
    },
  });
  if (error) return { status: "error", formError: authError(error) };

  // With email confirmation off, the customer is signed in straight away.
  if (data.session) redirect(`/${locale}/account`);
  // Otherwise ask them to confirm. The same message is shown for existing emails,
  // so the form cannot be used to find out who has an account.
  return { status: "done" };
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;

  const { locale, email, password, next } = parsed.data;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", formError: authError(error) };

  redirect(safeNextPath(next, `/${locale}/account`));
}

export async function logout(formData: FormData) {
  const locale = routing.locales.includes(formData.get("locale") as Locale)
    ? (formData.get("locale") as Locale)
    : routing.defaultLocale;
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect(`/${locale}`);
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;

  const { locale, email } = parsed.data;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: emailLink(`/${locale}/account/reset-password`),
  });
  if (error && authError(error) === "tooManyAttempts") {
    return { status: "error", formError: "tooManyAttempts" };
  }
  // Always "sent", whether or not the email has an account.
  return { status: "done" };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;

  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: "error", formError: "linkExpired" };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", formError: authError(error) };

  redirect(`/${parsed.data.locale}/account`);
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = profileSchema.safeParse(formValues(formData));
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/${parsed.data.locale}/account/login`);

  const { error } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
  });
  if (error) return { status: "error", formError: authError(error) };
  return { status: "done" };
}
