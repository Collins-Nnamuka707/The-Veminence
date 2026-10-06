import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { routing } from "@/i18n/routing";
import { display, sans, script } from "@/lib/fonts";
import { localeAlternates, siteUrl } from "@/lib/seo";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: siteUrl,
    title: { default: t("title"), template: "%s · The Veminence" },
    description: t("description"),
    alternates: localeAlternates(locale, ""),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable} ${script.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
