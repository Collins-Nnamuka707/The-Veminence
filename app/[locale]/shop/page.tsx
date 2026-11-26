import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShopListing } from "@/components/store/ShopListing";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const nav = await getTranslations({ locale, namespace: "Header.nav" });
  return { title: nav("shopAll"), alternates: localeAlternates(locale, "/shop") };
}

export default async function ShopPage() {
  const [tr, nav, categories, products] = await Promise.all([
    getTranslations("Shop"),
    getTranslations("Header.nav"),
    getCategories(),
    getProducts(),
  ]);
  return (
    <ShopListing
      title={nav("shopAll")}
      intro={tr("allIntro")}
      categories={categories}
      products={products}
      active={null}
    />
  );
}
