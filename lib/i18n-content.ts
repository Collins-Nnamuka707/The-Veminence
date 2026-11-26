import type { Locale } from "@/i18n/routing";

/**
 * Owner-managed text (product names, descriptions, categories). English is required;
 * Polish is optional (owner's decision, 2026-11-25).
 */
export type LocalizedText = { en: string; pl?: string | null };

/** Text for a locale, plus the language it is actually in (English when Polish is empty). */
export function localized(field: LocalizedText, locale: Locale): { text: string; lang: Locale } {
  if (locale === "pl" && field.pl && field.pl.trim() !== "") return { text: field.pl, lang: "pl" };
  return { text: field.en, lang: "en" };
}

/** Picks the text for a locale, falling back to English when Polish is empty. */
export function t(field: LocalizedText, locale: Locale): string {
  return localized(field, locale).text;
}

/**
 * `lang` attribute for owner text shown on a page in another language (English text on a Polish
 * page), so screen readers and browser translation (e.g. Chrome's Google Translate) treat it right.
 */
export function langAttr(field: LocalizedText, locale: Locale): Locale | undefined {
  const { lang } = localized(field, locale);
  return lang === locale ? undefined : lang;
}
