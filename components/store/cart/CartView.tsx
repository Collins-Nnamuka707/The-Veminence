"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { resolveCart, type CartRow } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";
import { t } from "@/lib/i18n-content";
import { formatPrice } from "@/lib/money";
import type { StoreProduct } from "@/lib/product-state";
import { getCartSuggestions } from "@/lib/related";
import { ProductCard } from "../ProductCard";
import { ProductImage } from "../ProductImage";
import { rich } from "../rich";

const noop = () => () => {};

export function CartView({ products }: { products: StoreProduct[] }) {
  const tr = useTranslations("Cart");
  const cart = useCart();
  // The cart is only known in the browser; show a placeholder during server render/hydration.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  if (!hydrated) {
    return <div className="mt-10 h-40 animate-pulse rounded-image bg-stone" aria-hidden="true" />;
  }

  const { rows, subtotal } = resolveCart(cart.lines, products);
  const itemCount = rows.reduce((sum, row) => sum + (row.available ? row.quantity : 0), 0);

  if (rows.length === 0) {
    return (
      <div className="mt-10 rounded-image bg-stone px-6 py-16 text-center">
        <p className="font-display text-2xl">{tr("empty")}</p>
        <Link href="/shop" className="btn-ink mt-6">
          {tr("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-stone border-y border-stone">
        {rows.map((row) => (
          <CartRowItem
            key={row.product.id}
            row={row}
            onQuantity={(q) => cart.setQuantity(row.product.id, q)}
            onRemove={() => cart.remove(row.product.id)}
          />
        ))}
      </ul>

      <aside className="h-fit rounded-image bg-stone p-6" aria-labelledby="summary-title">
        <h2 id="summary-title" className="font-display text-2xl font-medium">
          {tr("summary")}
        </h2>
        <dl className="mt-4 flex items-baseline justify-between gap-4">
          <dt>{tr("subtotal", { count: itemCount })}</dt>
          <dd className="text-lg font-medium whitespace-nowrap">{formatPrice(subtotal)}</dd>
        </dl>
        <p className="mt-2 text-sm text-ink">{tr("deliveryAtCheckout")}</p>
        {itemCount > 0 && (
          <Link href="/checkout" className="btn-ink mt-6 w-full">
            {tr("checkout")}
          </Link>
        )}
      </aside>

      <Suggestions products={getCartSuggestions(cart.lines.map((l) => l.id), products)} />
    </div>
  );
}

function Suggestions({ products }: { products: StoreProduct[] }) {
  const tr = useTranslations("Cart");
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="suggestions-title" className="pt-10 lg:col-span-2">
      <h2 id="suggestions-title" className="font-display text-3xl font-medium">
        {tr.rich("suggestions", rich)}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function CartRowItem({
  row,
  onQuantity,
  onRemove,
}: {
  row: CartRow;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const tr = useTranslations("Cart");
  const locale = useLocale() as Locale;
  const name = t(row.product.name, locale);

  return (
    <li className="flex gap-4 py-5" data-testid="cart-row">
      <Link href={`/product/${row.product.slug}`} className="w-20 shrink-0 sm:w-24">
        <ProductImage product={row.product} locale={locale} sizes="96px" dimmed={!row.available} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/product/${row.product.slug}`} className="font-display text-xl font-medium">
            {name}
          </Link>
          <p className="font-medium whitespace-nowrap">{formatPrice(row.lineTotal)}</p>
        </div>

        {row.available ? (
          <p className="text-sm text-muted">{tr("each", { price: formatPrice(row.unitPrice) })}</p>
        ) : (
          <p className="text-sm text-sale">{tr("unavailable")}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          {row.available ? (
            <div className="flex items-center rounded-full border border-stone" role="group" aria-label={tr("quantityFor", { name })}>
              <button
                type="button"
                onClick={() => onQuantity(row.quantity - 1)}
                aria-label={tr("decrease")}
                className="flex size-11 items-center justify-center rounded-full hover:bg-stone"
              >
                −
              </button>
              <span className="min-w-8 text-center tabular-nums" aria-live="polite">
                {row.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantity(row.quantity + 1)}
                disabled={row.quantity >= row.max}
                aria-label={tr("increase")}
                className="flex size-11 items-center justify-center rounded-full hover:bg-stone disabled:opacity-40"
              >
                +
              </button>
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onRemove}
            className="min-h-11 text-sm underline underline-offset-4 hover:text-olive"
          >
            {tr("remove")}
            <span className="sr-only"> {name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
