import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AccountLink } from "./AccountLink";
import { CartLink } from "./cart/CartLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

export const NAV_ITEMS = [
  { href: "/shop", key: "shopAll" },
  { href: "/shop/wigs", key: "wigs" },
  { href: "/shop/bundles", key: "bundles" },
  { href: "/shop/closures-frontals", key: "closuresFrontals" },
  { href: "/shop/new", key: "newIn" },
  { href: "/shop/bestsellers", key: "bestSellers" },
] as const;

export function Header() {
  const t = useTranslations("Header");

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t("skipToContent")}
      </a>

      <p className="bg-ink px-4 py-2.5 text-center text-[0.65rem] font-semibold tracking-[0.25em] text-white uppercase">
        {t("announcement")}
      </p>

      <header className="sticky top-0 z-40 border-b border-stone bg-white/95 backdrop-blur">
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {/* Mobile menu: <details> works without JavaScript. */}
            <details className="group relative lg:hidden">
              <summary
                className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
                aria-label={t("menu")}
              >
                <Menu className="size-5 group-open:hidden" aria-hidden="true" />
                <X className="hidden size-5 group-open:block" aria-hidden="true" />
              </summary>
              <nav aria-label={t("menu")} className="absolute top-full left-0 mt-3 w-64 border border-stone bg-white p-2 shadow-lg">
                <ul>
                  {NAV_ITEMS.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="flex min-h-11 items-center px-4 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-stone"
                      >
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
            <Link href="/" aria-label={t("home")}>
              <Logo />
            </Link>
          </div>

          <nav aria-label={t("menu")} className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-7">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="py-2 text-[0.7rem] font-semibold tracking-[0.15em] whitespace-nowrap uppercase underline-offset-8 hover:underline"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center">
            <LanguageSwitcher />
            <AccountLink />
            <CartLink />
          </div>
        </div>
      </header>
    </>
  );
}
