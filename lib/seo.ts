import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";

export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

/** Canonical + hreflang alternates for a storefront path such as "" or "/shop". */
export function localeAlternates(locale: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `/${l}${path}`;
  languages["x-default"] = `/${routing.defaultLocale}${path}`;

  return { canonical: `/${locale}${path}`, languages };
}
