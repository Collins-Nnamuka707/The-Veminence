import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AccountLink } from "./AccountLink";
import { CartLink } from "./cart/CartLink";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

const navItems = [
  { href: "/shop", key: "shop" },
  { href: "/shop/new", key: "newIn" },
  { href: "/shop/bestsellers", key: "bestSellers" },
  { href: "/#categories", key: "categories" },
] as const;

export function Header() {
  const t = useTranslations("Header");

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {t("skipToContent")}
      </a>

      <header className="sticky top-0 z-40 border-b border-stone bg-cream/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label={t("home")} className="rounded-sm">
            <Logo />
          </Link>

          <nav aria-label={t("menu")} className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="py-2 hover:text-olive">
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <AccountLink />
            <CartLink />

            {/* Mobile menu: <details> works without JavaScript. */}
            <details className="group relative md:hidden">
              <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full hover:bg-stone [&::-webkit-details-marker]:hidden">
                <span className="sr-only">{t("menu")}</span>
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="group-open:hidden"
                  />
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="hidden group-open:block"
                  />
                </svg>
              </summary>
              <nav
                aria-label={t("menu")}
                className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-stone bg-cream p-2 shadow-lg"
              >
                <ul>
                  {navItems.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="flex min-h-11 items-center rounded-xl px-4 hover:bg-stone"
                      >
                        {t(`nav.${item.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
