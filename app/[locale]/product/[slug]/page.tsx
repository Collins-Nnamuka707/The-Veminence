import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Price } from "@/components/store/Price";
import { ProductCard, StatusLine } from "@/components/store/ProductCard";
import { ProductDetailsLine } from "@/components/store/ProductDetailsLine";
import { ProductImage } from "@/components/store/ProductImage";
import { AddToCartButton } from "@/components/store/cart/AddToCartButton";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProductBySlug, getProducts } from "@/lib/data/catalog";
import { langAttr, t } from "@/lib/i18n-content";
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
      <Link href="/shop" className="inline-flex min-h-11 items-center text-[0.7rem] font-semibold tracking-[0.15em] uppercase hover:underline">
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
  const [product, all, categories] = await Promise.all([getProductBySlug(slug), getProducts(), getCategories()]);
  if (!product) notFound();

  const tr = await getTranslations("Product");
  const state = getCardState(product);
  const related = getRelatedProducts(product, all);
  const name = t(product.name, locale);

  const category = categories.find((c) => c.slug === product.category);
  const { lengthInches, laceSize, density, colour, hairOrigin } = product.details;
  const specs = [
    [tr("specs.type"), tr(`types.${product.productType}`)],
    [tr("specs.texture"), category ? t(category.name, locale) : null],
    [tr("specs.length"), lengthInches ? `${lengthInches}"` : null],
    [tr("specs.lace"), laceSize],
    [tr("specs.density"), density],
    [tr("specs.colour"), colour],
    [tr("specs.origin"), hairOrigin],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <>
      <div className="mt-4 grid gap-10 md:grid-cols-2 lg:gap-16">
        <ProductImage
          product={product}
          locale={locale}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          dimmed={state.availability === "out_of_stock"}
        />

        <div className="md:pt-4">
          <ProductDetailsLine product={product} className="eyebrow text-muted" />
          <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight uppercase sm:text-4xl" lang={langAttr(product.name, locale)}>
            {name}
          </h1>
          <div className="mt-5">
            <Price state={state} size="lg" />
          </div>
          <StatusLine product={product} state={state} />
          {state.canBuy && (
            <div className="mt-6">
              <AddToCartButton
                variantId={product.variantId}
                max={maxQuantity(product)}
                preorder={state.availability === "preorder"}
              />
            </div>
          )}

          <section aria-labelledby="specs-title" className="mt-10">
            <h2 id="specs-title" className="text-xs font-bold tracking-[0.2em] uppercase">
              {tr("specs.title")}
            </h2>
            <dl className="mt-3 divide-y divide-stone border-y border-stone text-sm">
              {specs.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {t(product.description, locale) && (
            <section aria-labelledby="description-title" className="mt-8">
              <h2 id="description-title" className="text-xs font-bold tracking-[0.2em] uppercase">
                {tr("description")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed" lang={langAttr(product.description, locale)}>
                {t(product.description, locale)}
              </p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24">
          <h2 id="related-title" className="heading">
            {tr("related")}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
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
        <div className="h-12 w-2/3 bg-stone" />
        <div className="h-6 w-1/3 bg-stone" />
        <div className="h-20 bg-stone" />
      </div>
    </div>
  );
}
