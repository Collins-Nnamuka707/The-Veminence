"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { priceOrder } from "@/lib/checkout";
import { getProducts } from "@/lib/data/catalog";
import { getStoreSettings } from "@/lib/data/settings";
import {
  checkoutAccountSchema,
  checkoutCartSchema,
  checkoutSchema,
  type CheckoutInput,
} from "@/lib/schemas/checkout";
import { fieldErrors } from "@/lib/schemas/errors";
import { siteUrl } from "@/lib/seo";
import { buildCheckoutSessionParams, getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CheckoutFormError = "cartEmpty" | "itemsUnavailable" | "paymentUnavailable" | "generic";

export type CheckoutState =
  | { status: "idle" }
  | { status: "error"; fieldErrors?: Record<string, string>; formError?: CheckoutFormError };

// TODO(database phase): rate limiting per IP and phone, and create_order with stock reservations.
export async function startCheckout(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  // Honeypot: real customers never see or fill this field.
  if (formData.get("website")) return { status: "error", formError: "generic" };

  const values = Object.fromEntries(
    [...formData.entries()].filter(([key]) => !key.startsWith("$ACTION_")),
  );
  const parsed = checkoutSchema.safeParse(values);
  const account = checkoutAccountSchema.safeParse(values);
  if (!parsed.success || !account.success) {
    return {
      status: "error",
      fieldErrors: {
        ...(parsed.success ? {} : fieldErrors(parsed.error)),
        ...(account.success ? {} : fieldErrors(account.error)),
      },
    };
  }

  const cart = checkoutCartSchema.safeParse(values.cart ?? "");
  if (!cart.success) return { status: "error", formError: "cartEmpty" };

  const input = parsed.data;
  const settings = getStoreSettings();
  const pricing = priceOrder(cart.data, await getProducts(), input.deliveryMethod, settings.deliveryFees);
  if (!pricing.ok) {
    return { status: "error", formError: pricing.reason === "empty" ? "cartEmpty" : "itemsUnavailable" };
  }

  const stripe = getStripe();
  if (!stripe) {
    console.error("Checkout: STRIPE_SECRET_KEY is not set, so payments cannot start.");
    return { status: "error", formError: "paymentUnavailable" };
  }

  // Root params are not available in server actions, so the locale is passed explicitly.
  const [tr, supabase] = await Promise.all([
    getTranslations({ locale: input.locale, namespace: "Checkout" }),
    createSupabaseServerClient(),
  ]);
  let customerId = supabase ? (await supabase.auth.getUser()).data.user?.id : undefined;

  if (!customerId && account.data.createAccount) {
    const created = await createAccountDuringCheckout(supabase, input, account.data.accountPassword);
    if (created.error) return { status: "error", fieldErrors: { accountPassword: created.error } };
    customerId = created.userId;
  }

  let paymentUrl: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams(input, pricing, {
        siteUrl,
        deliveryLabel: tr(`methods.${input.deliveryMethod}.name`),
        customerId,
      }),
    );
    paymentUrl = session.url;
  } catch (error) {
    console.error("Checkout: Stripe session could not be created.", error);
  }

  if (!paymentUrl) return { status: "error", formError: "paymentUnavailable" };
  redirect(paymentUrl);
}

/**
 * Best effort: the purchase must never fail because of the optional account. Only a password
 * Supabase rejects as weak is returned to the form, since the customer can fix that at once.
 */
async function createAccountDuringCheckout(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  input: CheckoutInput,
  password: string,
): Promise<{ userId?: string; error?: string }> {
  if (!supabase) {
    console.error("Checkout: Supabase is not configured, so the optional account was not created.");
    return {};
  }
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password,
    options: {
      data: { full_name: input.fullName, phone: input.phone },
      emailRedirectTo: `${siteUrl.origin}/auth/confirm?next=${encodeURIComponent(`/${input.locale}/account`)}`,
    },
  });
  if (error?.code === "weak_password") return { error: "weakPassword" };
  if (error) {
    console.error("Checkout: optional account could not be created.", error.code);
    return {};
  }
  // An existing email comes back without identities; never attach the order to that account.
  return { userId: data.user?.identities?.length ? data.user.id : undefined };
}
