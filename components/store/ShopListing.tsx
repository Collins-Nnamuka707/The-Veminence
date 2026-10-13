import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { t } from "@/lib/i18n-content";
import type { Category, CategorySlug, StoreProduct } from "@/lib/product-state";
import { ProductCard } from "./ProductCard";
import { rich } from "./rich";

type Props = {
  categories: Category[];
  products: StoreProduct[];
  active: CategorySlug | null;
};

export function ShopListing({ categories, products, active }: Props) {
  const tr = useTranslations("Shop");
  const locale = useLocale() as Locale;
  const activeCategory = categories.find((c) => c.slug === active);

  const filters = [
    { href: "/shop", label: tr("all"), current: active === null },
    ...categories.map((c) => ({
      href: `/shop/${c.slug}`,
      label: t(c.name, locale),
      current: c.slug === active,
    })),
  ];

  return (
    <div className="container-page pt-12 pb-24">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">
        {activeCategory ? t(activeCategory.name, locale) : tr.rich("heading", rich)}
      </h1>
      <p className="mt-2 text-sm text-muted">{tr("count", { count: products.length })}</p>

      <nav aria-label={tr("title")} className="mt-8 -mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {filters.map((f) => (
            <li key={f.href}>
              <Link
                href={f.href}
                aria-current={f.current ? "page" : undefined}
                className={`btn min-h-10 px-5 whitespace-nowrap ${
                  f.current ? "bg-ink text-cream" : "border border-stone hover:border-ink"
                }`}
              >
                {f.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 2} />
        ))}
      </div>
    </div>
  );
}

export function ShopListingSkeleton() {
  return (
    <div className="container-page animate-pulse pt-12 pb-24" aria-hidden="true">
      <div className="h-12 w-48 rounded-full bg-stone" />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="aspect-[4/5] rounded-image bg-stone" />
        ))}
      </div>
    </div>
  );
}
