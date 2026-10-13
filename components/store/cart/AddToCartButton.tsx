"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-store";

type Props = {
  productId: string;
  /** Most this cart may hold of the product (stock, or the pre-order cap). */
  max: number;
  preorder: boolean;
};

export function AddToCartButton({ productId, max, preorder }: Props) {
  const t = useTranslations("Product");
  const cart = useCart();
  const [added, setAdded] = useState(false);

  const inCart = cart.lines.find((line) => line.id === productId)?.quantity ?? 0;
  const atMax = inCart >= max;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        disabled={atMax}
        onClick={() => {
          cart.add(productId);
          setAdded(true);
        }}
        className="btn-ink w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {preorder ? t("preorderAddToCart") : t("addToCart")}
      </button>

      <p role="status" className="text-sm">
        {added ? (
          <span className="text-olive">{t("addedToCart")} </span>
        ) : atMax && inCart > 0 ? (
          <span className="text-muted">{t("maxInCart")} </span>
        ) : null}
        {inCart > 0 && (
          <Link href="/cart" className="font-medium underline underline-offset-4">
            {t("viewCart", { count: inCart })}
          </Link>
        )}
      </p>
    </div>
  );
}
