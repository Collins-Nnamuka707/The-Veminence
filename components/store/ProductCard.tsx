import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { t } from "@/lib/i18n-content";
import { getCardState, type CardState, type StoreProduct } from "@/lib/product-state";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";

type Props = {
  product: StoreProduct;
  priority?: boolean;
};

/**
 * The one product card. Handles in stock, low stock, out of stock,
 * pre-order, on sale and coming soon (see getCardState).
 */
export function ProductCard({ product, priority = false }: Props) {
  const locale = useLocale() as Locale;
  const state = getCardState(product);
  const name = t(product.name, locale);

  return (
    <article className="group relative" data-availability={state.availability}>
      <div className="relative">
        <ProductImage
          product={product}
          locale={locale}
          sizes="(min-width: 768px) 25vw, 50vw"
          priority={priority}
          dimmed={state.availability === "out_of_stock"}
        />
        <Badges product={product} state={state} />
      </div>

      <h3 className="mt-3 font-display text-xl font-medium">
        {/* The link covers the whole card. */}
        <Link
          href={`/product/${product.slug}`}
          className="after:absolute after:inset-0 after:rounded-image after:content-['']"
        >
          {name}
        </Link>
      </h3>

      <div className="mt-1">
        <Price state={state} />
      </div>
      <StatusLine product={product} state={state} />
    </article>
  );
}

function Badges({ product, state }: { product: StoreProduct; state: CardState }) {
  const tr = useTranslations("Product.badge");
  const badges: Array<{ label: string; className: string }> = [];

  if (state.availability === "coming_soon") {
    badges.push({ label: tr("comingSoon"), className: "bg-ink text-cream" });
  } else if (state.availability === "out_of_stock") {
    badges.push({ label: tr("soldOut"), className: "bg-ink text-cream" });
  } else if (state.availability === "preorder") {
    badges.push({ label: tr("preorder"), className: "bg-gold text-ink" });
  }
  if (state.onSale && state.discountPercent) {
    badges.push({ label: tr("sale", { percent: state.discountPercent }), className: "bg-sale text-cream" });
  }
  if (product.isNew && state.availability !== "coming_soon" && badges.length < 2) {
    badges.push({ label: tr("new"), className: "bg-cream text-ink" });
  }

  if (badges.length === 0) return null;

  return (
    <ul className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
      {badges.map((badge) => (
        <li
          key={badge.label}
          className={`rounded-full px-3 py-1 text-[0.7rem] font-medium tracking-wide uppercase ${badge.className}`}
        >
          {badge.label}
        </li>
      ))}
    </ul>
  );
}

export function StatusLine({ product, state }: { product: StoreProduct; state: CardState }) {
  const tr = useTranslations("Product.status");

  const lines = {
    in_stock: { text: tr("inStock"), className: "text-olive" },
    low_stock: { text: tr("lowStock", { count: product.available }), className: "text-sale" },
    out_of_stock: { text: tr("outOfStock"), className: "text-muted" },
    preorder: { text: tr("preorder"), className: "text-olive" },
    coming_soon: { text: tr("comingSoon"), className: "text-olive" },
  } as const;
  const line = lines[state.availability];

  return <p className={`mt-1 text-xs ${line.className}`}>{line.text}</p>;
}
