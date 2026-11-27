import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { CollectionKey } from "@/lib/collections";
import { t } from "@/lib/i18n-content";
import type { Category, StoreProduct } from "@/lib/product-state";
import { CollectionHero } from "./CollectionHero";
import { COLLECTION_IMAGES } from "./collection-images";
import { NAV_ITEMS } from "./Header";
import { ProductCard } from "./ProductCard";

type Props = {
  title: string;
  intro?: string;
  /** Language of title/intro when it differs from the page (owner texts without Polish). */
  lang?: string;
  categories: Category[];
  products: StoreProduct[];
  /** The collection being shown, or null for the whole shop. */
  active: CollectionKey | null;
};

/** Collection page: banner, filters by type and texture, product grid. */
export function ShopListing({ title, intro, lang, categories, products, active }: Props) {
  const tr = useTranslations("Shop");
  const nav = useTranslations("Header.nav");
  const locale = useLocale() as Locale;

  const typeFilters = NAV_ITEMS.map((item) => ({
    href: item.href,
    label: nav(item.key),
    current: item.href === "/shop" ? active === null : item.href === `/shop/${active}`,
  }));
  const textureFilters = categories.map((c) => ({
    href: `/shop/${c.slug}`,
    label: t(c.name, locale),
    current: c.slug === active,
  }));

  return (
    <>
      <CollectionHero title={title} intro={intro} lang={lang} image={active ? COLLECTION_IMAGES[active] : undefined} />

      <div className="container-page pt-8 pb-24">
        <div className="flex flex-col gap-4 border-b border-stone pb-6">
          <FilterRow label={tr("typeFilter")} filters={typeFilters} />
          <FilterRow label={tr("textureFilter")} filters={textureFilters} />
        </div>
        <p className="mt-6 text-center text-xs tracking-[0.15em] text-muted uppercase">{tr("count", { count: products.length })}</p>

        {products.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md text-center">
            <p className="text-sm text-muted">{tr("empty")}</p>
            <Link href="/shop" className="btn-ink mt-6">
              {nav("shopAll")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterRow({ label, filters }: { label: string; filters: { href: string; label: string; current: boolean }[] }) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4">
      <ul className="flex items-center gap-2">
        <li className="mr-2 shrink-0 text-[0.65rem] font-semibold tracking-[0.2em] text-muted uppercase">{label}</li>
        {filters.map((f) => (
          <li key={f.href} className="shrink-0">
            <Link
              href={f.href}
              aria-current={f.current ? "page" : undefined}
              className={`inline-flex min-h-9 items-center border px-4 text-[0.65rem] font-semibold tracking-[0.15em] whitespace-nowrap uppercase transition-colors ${
                f.current ? "border-ink bg-ink text-white" : "border-stone hover:border-ink"
              }`}
            >
              {f.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
