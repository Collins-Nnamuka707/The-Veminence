"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const other = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  return (
    <Link
      href={pathname}
      locale={other}
      hrefLang={other}
      lang={other}
      aria-label={t("switchTo")}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-medium hover:bg-stone sm:px-3"
    >
      <span className="text-xs tracking-widest text-olive uppercase">{other}</span>
      {/* The full language name only fits next to the icons on wider screens. */}
      <span aria-hidden="true" className="hidden sm:inline">
        {t("switchTo")}
      </span>
    </Link>
  );
}
