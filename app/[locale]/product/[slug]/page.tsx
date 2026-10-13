import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Price } from "@/components/store/Price";
import { StatusLine } from "@/components/store/ProductCard";
import { ProductImage } from "@/components/store/ProductImage";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProductBySlug, getProducts } from "@/lib/data/catalog";
import { t } from "@/lib/i18n-content";
import { getCardState } from "@/lib/product-state";
import { localeAlternates } from "@/lib/seo";

type Props = PageProps<"/[locale]/product/[slug]">;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: t(product.name, locale as Locale),
    description: t(product.description, locale as Locale),
    alternates: localeAlternates(locale as Locale, `/product/${slug}`),
  };
}

// Phase 1: read-only. Variant picker and add-to-cart arrive with the cart phase.
// The URL-specific part sits behind Suspense so navigation can show the shell instantly.
export default async function ProductPage({ params }: Props) {
  const tr = await getTranslations("Product");

  return (
    <div className="container-page pt-8 pb-24">
      <Link href="/shop" className="inline-flex min-h-11 items-center text-sm text-olive hover:underline">
        ← {tr("backToShop")}
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetails({ params }: Pick<Props, "params">) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const tr = await getTranslations("Product");
  const state = getCardState(product);

  return (
    <div className="mt-4 grid gap-10 md:grid-cols-2">
      <ProductImage
        product={product}
        locale={locale}
        sizes="(min-width: 768px) 50vw, 100vw"
        priority
        dimmed={state.availability === "out_of_stock"}
      />

      <div className="md:pt-6">
        <h1 className="font-display text-4xl font-medium sm:text-5xl">{t(product.name, locale)}</h1>
        <div className="mt-4">
          <Price state={state} size="lg" />
          <p className="mt-1 text-xs text-muted">{tr("vatIncluded")}</p>
        </div>
        <StatusLine product={product} state={state} />
        <p className="mt-6 leading-relaxed">{t(product.description, locale)}</p>
        <p className="mt-8 rounded-2xl bg-stone p-4 text-sm">{tr("orderingSoon")}</p>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mt-4 grid animate-pulse gap-10 md:grid-cols-2" aria-hidden="true">
      <div className="aspect-[4/5] rounded-image bg-stone" />
      <div className="space-y-4 md:pt-6">
        <div className="h-12 w-2/3 rounded-full bg-stone" />
        <div className="h-6 w-1/3 rounded-full bg-stone" />
        <div className="h-20 rounded-2xl bg-stone" />
      </div>
    </div>
  );
}
