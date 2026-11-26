import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "./Header";
import { Logo } from "./Logo";

export function Footer({ whatsappHref }: { whatsappHref: string }) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Header.nav");

  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{t("tagline")}</p>
        </div>

        <FooterColumn title={t("shop")}>
          {NAV_ITEMS.map((item) => (
            <FooterLink key={item.key} href={item.href}>
              {nav(item.key)}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title={t("help")}>
          <FooterLink href="/#faq">{t("faq")}</FooterLink>
          <FooterLink href="/account">{t("account")}</FooterLink>
          <FooterLink href="/cart">{t("cart")}</FooterLink>
        </FooterColumn>

        <FooterColumn title={t("contact")}>
          <li>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center text-sm hover:underline">
              WhatsApp
            </a>
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-ink/10">
        <p className="container-page py-6 text-[0.7rem] tracking-[0.15em] text-muted uppercase">
          © The Veminence. {t("rights")}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-[0.7rem] font-bold tracking-[0.2em] uppercase">{title}</h2>
      <ul className="mt-4 space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-9 items-center text-sm hover:underline">
        {children}
      </Link>
    </li>
  );
}
