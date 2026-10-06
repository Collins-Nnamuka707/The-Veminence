import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

// Reads the locale from the [locale] root segment instead of request headers,
// so storefront pages can still be prerendered with Cache Components.
export default getRequestConfig(async ({ locale }) => {
  const candidate = locale ?? (await rootLocale());
  const resolved = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale;

  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
