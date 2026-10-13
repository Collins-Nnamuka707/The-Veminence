"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { startCheckout, type CheckoutState } from "@/app/[locale]/checkout/actions";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { resolveCart } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";
import { t } from "@/lib/i18n-content";
import { formatPrice, type Grosze } from "@/lib/money";
import type { StoreProduct } from "@/lib/product-state";
import {
  checkoutAccountSchema,
  checkoutSchema,
  DELIVERY_METHODS,
  type DeliveryMethod,
} from "@/lib/schemas/checkout";
import { fieldErrors } from "@/lib/schemas/errors";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PasswordField } from "../forms/PasswordField";
import { TextField as Field } from "../forms/TextField";

const noop = () => () => {};
const initialState: CheckoutState = { status: "idle" };

const emptyValues = {
  email: "",
  fullName: "",
  phone: "",
  deliveryMethod: "inpost_locker" as DeliveryMethod,
  lockerCode: "",
  street: "",
  apartment: "",
  postcode: "",
  city: "",
  notes: "",
  /** "on" when the customer ticks "also create an account" (optional). */
  createAccount: "",
  accountPassword: "",
};
type Values = typeof emptyValues;

type Props = {
  products: StoreProduct[];
  deliveryFees: Record<DeliveryMethod, Grosze>;
};

export function CheckoutForm({ products, deliveryFees }: Props) {
  const tr = useTranslations("Checkout");
  const locale = useLocale() as Locale;
  const cart = useCart();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [state, formAction, pending] = useActionState(startCheckout, initialState);
  // Controlled fields keep what the customer typed if the server sends back an error.
  const [values, setValues] = useState<Values>(emptyValues);
  const [clientErrors, setClientErrors] = useState<Record<string, string> | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  // Signed-in customers get their details filled in (without overwriting anything typed).
  useEffect(() => {
    createSupabaseBrowserClient()
      ?.auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) return;
        setSignedIn(true);
        const meta = user.user_metadata as { full_name?: string; phone?: string };
        setValues((v) => ({
          ...v,
          email: v.email || user.email || "",
          fullName: v.fullName || meta.full_name || "",
          phone: v.phone || meta.phone || "",
        }));
      });
  }, []);

  if (!hydrated) {
    return <div className="mt-10 h-96 animate-pulse rounded-image bg-stone" aria-hidden="true" />;
  }

  const rows = resolveCart(cart.lines, products).rows.filter((row) => row.available);
  if (rows.length === 0) {
    return (
      <div className="mt-10 rounded-image bg-stone px-6 py-16 text-center">
        <p className="font-display text-2xl">{tr("errors.cartEmpty")}</p>
        <Link href="/shop" className="btn-ink mt-6">
          {tr("browse")}
        </Link>
      </div>
    );
  }

  const subtotal = rows.reduce((sum, row) => sum + row.lineTotal, 0);
  const deliveryFee = deliveryFees[values.deliveryMethod];
  const cartValue = JSON.stringify(rows.map((row) => ({ id: row.product.id, quantity: row.quantity })));

  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errors = clientErrors ?? serverErrors;
  const hasFieldErrors = Object.keys(errors).length > 0;
  const formError = state.status === "error" && !clientErrors ? state.formError : undefined;

  const set = (name: keyof Values) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (clientErrors?.[name]) {
      setClientErrors(Object.fromEntries(Object.entries(clientErrors).filter(([key]) => key !== name)));
    }
  };

  const errorText = (name: string) => (errors[name] ? tr(`errors.${errors[name]}`) : undefined);

  return (
    <form
      action={formAction}
      noValidate
      onSubmit={(event) => {
        // Same schema as the server, so most mistakes are caught before the round trip.
        const parsed = checkoutSchema.safeParse({ ...values, locale });
        const account = checkoutAccountSchema.safeParse(values);
        if (!parsed.success || !account.success) {
          event.preventDefault();
          const found = {
            ...(parsed.success ? {} : fieldErrors(parsed.error)),
            ...(account.success ? {} : fieldErrors(account.error)),
          };
          setClientErrors(found);
          const first = Object.keys(found)[0];
          document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
        } else {
          setClientErrors(null);
        }
      }}
      className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="cart" value={cartValue} />
      {/* Honeypot for bots; hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="space-y-10">
        {(hasFieldErrors || formError) && (
          <div role="alert" className="rounded-2xl border border-sale bg-cream p-4 text-sm text-sale">
            {formError ? tr(`errors.${formError}`) : tr("errors.fixErrors")}
            {formError === "itemsUnavailable" && (
              <>
                {" "}
                <Link href="/cart" className="font-medium underline underline-offset-4">
                  {tr("backToCart")}
                </Link>
              </>
            )}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl font-medium">{tr("contact")}</legend>
          {!signedIn && (
            <p className="text-sm">
              {tr("guestNote")} {tr("haveAccount")}{" "}
              <Link
                href={{ pathname: "/account/login", query: { next: `/${locale}/checkout` } }}
                className="font-medium underline underline-offset-4"
              >
                {tr("login")}
              </Link>
            </p>
          )}
          <Field name="email" type="email" autoComplete="email" label={tr("email")}
            value={values.email} onValue={set("email")} error={errorText("email")} />
          <Field name="fullName" autoComplete="name" label={tr("fullName")}
            value={values.fullName} onValue={set("fullName")} error={errorText("fullName")} />
          <Field name="phone" type="tel" autoComplete="tel" label={tr("phone")} hint={tr("phoneHint")}
            value={values.phone} onValue={set("phone")} error={errorText("phone")} />

          {!signedIn && (
            <div className="rounded-2xl border border-stone p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="createAccount"
                  value="on"
                  checked={values.createAccount === "on"}
                  onChange={(e) => set("createAccount")(e.target.checked ? "on" : "")}
                  className="mt-1 size-4 accent-ink"
                />
                <span>
                  <span className="font-medium">{tr("createAccount")}</span>
                  <span className="mt-1 block text-sm text-olive">{tr("createAccountHint")}</span>
                </span>
              </label>
              {values.createAccount === "on" && (
                <div className="mt-4">
                  <PasswordField
                    name="accountPassword"
                    label={tr("accountPassword")}
                    autoComplete="new-password"
                    hint={tr("accountPasswordHint")}
                    value={values.accountPassword}
                    onValue={set("accountPassword")}
                    error={errorText("accountPassword")}
                  />
                </div>
              )}
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-display text-2xl font-medium">{tr("delivery")}</legend>
          <div className="grid gap-3">
            {DELIVERY_METHODS.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone p-4 has-[:checked]:border-ink has-[:checked]:bg-stone/50"
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method}
                  checked={values.deliveryMethod === method}
                  onChange={() => set("deliveryMethod")(method)}
                  className="mt-1 size-4 accent-ink"
                />
                <span className="flex-1">
                  <span className="flex justify-between gap-3 font-medium">
                    {tr(`methods.${method}.name`)}
                    <span className="whitespace-nowrap">
                      {deliveryFees[method] === 0 ? tr("free") : formatPrice(deliveryFees[method])}
                    </span>
                  </span>
                  <span className="mt-1 block text-sm text-olive">{tr(`methods.${method}.description`)}</span>
                </span>
              </label>
            ))}
          </div>

          {values.deliveryMethod === "inpost_locker" && (
            <Field
              name="lockerCode"
              label={tr("lockerCode")}
              autoComplete="off"
              value={values.lockerCode}
              onValue={set("lockerCode")}
              error={errorText("lockerCode")}
              hint={
                <>
                  {tr("lockerHint")}{" "}
                  <a
                    href="https://inpost.pl/znajdz-paczkomat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-ink underline underline-offset-4"
                  >
                    {tr("findLocker")}
                  </a>
                </>
              }
            />
          )}

          {values.deliveryMethod === "courier" && (
            <div className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Field name="street" autoComplete="address-line1" label={tr("street")}
                  value={values.street} onValue={set("street")} error={errorText("street")} />
              </div>
              <div className="sm:col-span-2">
                <Field name="apartment" autoComplete="address-line2" label={tr("apartment")}
                  value={values.apartment} onValue={set("apartment")} error={errorText("apartment")} />
              </div>
              <div className="sm:col-span-2">
                <Field name="postcode" autoComplete="postal-code" label={tr("postcode")} placeholder="00-000"
                  value={values.postcode} onValue={set("postcode")} error={errorText("postcode")} />
              </div>
              <div className="sm:col-span-4">
                <Field name="city" autoComplete="address-level2" label={tr("city")}
                  value={values.city} onValue={set("city")} error={errorText("city")} />
              </div>
            </div>
          )}
        </fieldset>

        <div>
          <label htmlFor="notes" className="text-sm font-medium">
            {tr("notes")}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set("notes")(e.target.value)}
            aria-invalid={errors.notes ? true : undefined}
            className="mt-1 block w-full rounded-2xl border border-muted bg-cream px-4 py-3"
          />
          {errorText("notes") && <p className="mt-1 text-sm text-sale">{errorText("notes")}</p>}
        </div>
      </div>

      <aside className="h-fit rounded-image bg-stone p-6 lg:sticky lg:top-24" aria-labelledby="order-title">
        <h2 id="order-title" className="font-display text-2xl font-medium">
          {tr("summary")}
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.product.id} className="flex justify-between gap-3">
              <span>
                {t(row.product.name, locale)} × {row.quantity}
              </span>
              <span className="whitespace-nowrap">{formatPrice(row.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-cream pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt>{tr("subtotal")}</dt>
            <dd className="whitespace-nowrap">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>{tr("deliveryFee")}</dt>
            <dd className="whitespace-nowrap">{deliveryFee === 0 ? tr("free") : formatPrice(deliveryFee)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-cream pt-3 text-base font-medium">
            <dt>{tr("total")}</dt>
            <dd className="text-lg whitespace-nowrap" data-testid="checkout-total">
              {formatPrice(subtotal + deliveryFee)}
            </dd>
          </div>
        </dl>
        <button type="submit" disabled={pending} className="btn-ink mt-6 w-full disabled:opacity-60">
          {pending ? tr("paying") : tr("pay")}
        </button>
        <p className="mt-3 text-center text-xs text-ink">{tr("securePayment")}</p>
      </aside>
    </form>
  );
}
