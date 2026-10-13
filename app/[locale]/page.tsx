import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HairPattern } from "@/components/store/HairPattern";
import { Marquee } from "@/components/store/Marquee";
import { Price } from "@/components/store/Price";
import { ProductCard } from "@/components/store/ProductCard";
import { rich } from "@/components/store/rich";
import { SectionHeading } from "@/components/store/SectionHeading";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCategories, getNewArrivals } from "@/lib/data/catalog";
import { t } from "@/lib/i18n-content";
import { getCardState, type Category, type StoreProduct } from "@/lib/product-state";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates(locale as Locale, "") };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const tr = await getTranslations("Home");
  const [categories, newArrivals] = await Promise.all([getCategories(), getNewArrivals(4)]);

  return (
    <>
      <Hero locale={locale} featured={newArrivals[0]} />

      <Marquee
        items={[tr("marquee.one"), tr("marquee.two"), tr("marquee.three"), tr("marquee.four")]}
      />

      <section aria-labelledby="categories-title" id="categories" className="container-page scroll-mt-24 pt-20">
        <SectionHeading
          id="categories-title"
          eyebrow={tr("categories.eyebrow")}
          title={tr.rich("categories.title", rich)}
        />
        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryCard category={category} locale={locale} cta={tr("categories.shopNow")} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="new-title" id="new-arrivals" className="container-page scroll-mt-24 pt-20 pb-24">
        <SectionHeading
          id="new-title"
          eyebrow={tr("newArrivals.eyebrow")}
          title={tr.rich("newArrivals.title", rich)}
        />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/shop/new" className="btn-outline">
            {tr("newArrivals.viewAll")}
          </Link>
        </div>
      </section>
    </>
  );
}

async function Hero({ locale, featured }: { locale: Locale; featured?: StoreProduct }) {
  const tr = await getTranslations("Home.hero");

  return (
    <section className="on-dark relative overflow-hidden bg-ink text-cream">
      <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow text-gold">{tr("eyebrow")}</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] font-medium sm:text-6xl">
            {tr.rich("title", {
              script: (chunks) => (
                <span className="font-script px-[0.12em] text-[1.15em] font-normal text-gold">{chunks}</span>
              ),
            })}
          </h1>
          <p className="mt-6 max-w-md text-cream/80">{tr("text")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-gold">
              {tr("cta")}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="aspect-[4/5] overflow-hidden rounded-t-full rounded-b-image bg-olive">
            <HairPattern variant="wavy" color="#D4AF6A" className="size-full" />
          </div>
          {featured && <FeaturedCard product={featured} locale={locale} />}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ product, locale }: { product: StoreProduct; locale: Locale }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="absolute -bottom-6 -left-2 flex items-center gap-3 rounded-2xl bg-cream p-3 pr-5 text-ink shadow-xl sm:-left-10"
    >
      <div className="size-14 overflow-hidden rounded-xl bg-stone">
        <HairPattern variant="straight" color="#6B5E3F" className="size-full" />
      </div>
      <div>
        <p className="font-display text-lg leading-tight font-medium">{t(product.name, locale)}</p>
        <Price state={getCardState(product)} />
      </div>
    </Link>
  );
}

function CategoryCard({ category, locale, cta }: { category: Category; locale: Locale; cta: string }) {
  const pattern = category.slug === "curly" ? "curly" : category.slug === "wavy" ? "wavy" : "straight";

  return (
    <Link
      href={`/shop/${category.slug}`}
      className="group on-dark relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-image bg-ink p-5 text-cream sm:aspect-[3/4]"
    >
      <HairPattern
        variant={pattern}
        color="#D4AF6A"
        className="absolute inset-0 size-full opacity-60 transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <span className="relative">
        <span className="block font-display text-2xl font-medium sm:text-3xl">{t(category.name, locale)}</span>
        <span className="mt-1 hidden text-sm text-cream/80 sm:block">{t(category.description, locale)}</span>
        <span className="mt-3 inline-block text-sm text-gold underline-offset-4 group-hover:underline">
          {cta} →
        </span>
      </span>
    </Link>
  );
}
