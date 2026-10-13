import type { Locale } from "@/i18n/routing";

/** Owner-managed text. Polish is required; English is optional. */
export type LocalizedText = { pl: string; en?: string | null };

/** Picks the text for a locale, falling back to Polish when English is empty. */
export function t(field: LocalizedText, locale: Locale): string {
  if (locale === "en" && field.en && field.en.trim() !== "") {
    return field.en;
  }
  return field.pl;
}
