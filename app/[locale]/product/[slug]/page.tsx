import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Price } from "@/components/store/Price";
import { ProductCard, StatusLine } from "@/components/store/ProductCard";
import { ProductImage } from "@/components/store/ProductImage";
import { rich } from "@/components/store/rich";
import { AddToCartButton } from "@/components/store/cart/AddToCartButton";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProductBySlug, getProducts } from "@/lib/data/catalog";
import { t } from "@/lib/i18n-content";
import { getCardState } from "@/lib/product-state";
import { maxQuantity } from "@/lib/cart";
import { getRelatedProducts } from "@/lib/related";
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
  const [product, all] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!product) notFound();

  const tr = await getTranslations("Product");
  const state = getCardState(product);
  const related = getRelatedProducts(product, all);
  const name = t(product.name, locale);

  return (
    <>
      <div className="mt-4 grid gap-10 md:grid-cols-2">
        <ProductImage
          product={product}
          locale={locale}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          dimmed={state.availability === "out_of_stock"}
        />

        <div className="md:pt-6">
          <h1 className="font-display text-4xl font-medium sm:text-5xl">{name}</h1>
          <div className="mt-4">
            <Price state={state} size="lg" />
          </div>
          <StatusLine product={product} state={state} />
          {state.canBuy && (
            <div className="mt-6">
              <AddToCartButton
                productId={product.id}
                max={maxQuantity(product)}
                preorder={state.availability === "preorder"}
              />
            </div>
          )}
          <p className="mt-6 leading-relaxed">{t(product.description, locale)}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24">
          <h2 id="related-title" className="font-display text-3xl font-medium sm:text-4xl">
            {tr.rich("related", rich)}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
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
