import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopListing, ShopListingSkeleton } from "@/components/store/ShopListing";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { t } from "@/lib/i18n-content";
import { localeAlternates } from "@/lib/seo";

type Props = PageProps<"/[locale]/shop/[category]">;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  const match = (await getCategories()).find((c) => c.slug === category);
  if (!match) return {};
  return {
    title: t(match.name, locale as Locale),
    alternates: localeAlternates(locale as Locale, `/shop/${category}`),
  };
}

// The URL-specific part sits behind Suspense so navigation can show the shell instantly.
export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<ShopListingSkeleton />}>
      <CategoryListing params={params} />
    </Suspense>
  );
}

async function CategoryListing({ params }: Pick<Props, "params">) {
  const { category } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const match = categories.find((c) => c.slug === category);
  if (!match) notFound();

  return (
    <ShopListing
      categories={categories}
      products={products.filter((p) => p.category === match.slug)}
      active={match.slug}
    />
  );
}
