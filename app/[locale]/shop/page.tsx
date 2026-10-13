import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShopListing } from "@/components/store/ShopListing";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Shop" });
  return { title: t("title"), alternates: localeAlternates(locale, "/shop") };
}

export default async function ShopPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return <ShopListing categories={categories} products={products} active={null} />;
}
