import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ShopListing } from "@/components/store/ShopListing";
import type { Locale } from "@/i18n/routing";
import { ALL_COLLECTION_KEYS, collectionProducts, isCollectionKey, isTexture, type CollectionKey } from "@/lib/collections";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { langAttr, t } from "@/lib/i18n-content";
import type { Category } from "@/lib/product-state";
import { localeAlternates } from "@/lib/seo";

type Props = PageProps<"/[locale]/shop/[collection]">;

export function generateStaticParams() {
  return ALL_COLLECTION_KEYS.map((collection) => ({ collection }));
}

/** Title and intro: textures come from the database (owner text), the rest from messages. */
async function describe(key: CollectionKey, locale: Locale, categories: Category[]) {
  if (isTexture(key)) {
    const category = categories.find((c) => c.slug === key);
    if (!category) return null;
    return {
      title: t(category.name, locale),
      intro: t(category.description, locale),
      lang: langAttr(category.name, locale),
    };
  }
  const tr = await getTranslations({ locale, namespace: "Shop.collections" });
  return { title: tr(key), intro: tr(`${key}Intro`), lang: undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, collection } = await params;
  if (!isCollectionKey(collection)) return {};
  const text = await describe(collection, locale as Locale, await getCategories());
  if (!text) return {};
  return {
    title: text.title,
    description: text.intro,
    alternates: localeAlternates(locale as Locale, `/shop/${collection}`),
  };
}

// The URL-specific part sits behind Suspense so navigation can show the shell instantly.
export default function CollectionPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-72 animate-pulse bg-ink" aria-hidden="true" />}>
      <Collection params={params} />
    </Suspense>
  );
}

async function Collection({ params }: Pick<Props, "params">) {
  const { locale, collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const text = await describe(collection, locale as Locale, categories);
  if (!text) notFound();

  return (
    <ShopListing
      title={text.title}
      intro={text.intro}
      lang={text.lang}
      categories={categories}
      products={collectionProducts(collection, products)}
      active={collection}
    />
  );
}
