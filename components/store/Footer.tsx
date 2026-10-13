import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="on-dark bg-ink text-cream">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo tone="dark" />
          <p className="mt-4 max-w-xs text-sm text-cream/80">{t("tagline")}</p>
        </div>

        <FooterColumn title={t("shop")}>
          <FooterLink href="/shop">{t("allWigs")}</FooterLink>
          <FooterLink href="/#new-arrivals">{t("newArrivals")}</FooterLink>
        </FooterColumn>

        <FooterColumn title={t("help")}>
          <FooterLink href="/#how-it-works">{t("howToOrder")}</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-cream/15">
        <p className="container-page py-6 text-xs text-cream/70">
          © The Veminence. {t("rights")}
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow text-gold">{title}</h2>
      <ul className="mt-4 space-y-1 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-11 items-center hover:text-gold">
        {children}
      </Link>
    </li>
  );
}
