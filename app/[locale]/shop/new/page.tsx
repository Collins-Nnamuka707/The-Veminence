import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShopListing } from "@/components/store/ShopListing";
import type { Locale } from "@/i18n/routing";
import { getNewArrivals, getCategories } from "@/lib/data/catalog";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop/new">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Shop.collections" });
  return { title: t("new"), alternates: localeAlternates(locale, "/shop/new") };
}

// Newest wigs (static segment, so it takes priority over /shop/[category]).
export default async function NewInPage() {
  const [categories, products] = await Promise.all([getCategories(), getNewArrivals()]);
  return <ShopListing categories={categories} products={products} active="new" />;
}
