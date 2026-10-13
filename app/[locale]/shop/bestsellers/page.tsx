import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShopListing } from "@/components/store/ShopListing";
import type { Locale } from "@/i18n/routing";
import { getBestSellers, getCategories } from "@/lib/data/catalog";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop/bestsellers">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Shop.collections" });
  return { title: t("bestsellers"), alternates: localeAlternates(locale, "/shop/bestsellers") };
}

// Most sold wigs first (static segment, so it takes priority over /shop/[category]).
export default async function BestSellersPage() {
  const [categories, products] = await Promise.all([getCategories(), getBestSellers()]);
  return <ShopListing categories={categories} products={products} active="bestsellers" />;
}
