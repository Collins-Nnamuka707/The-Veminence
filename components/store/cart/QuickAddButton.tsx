"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";

type Props = { variantId: string; max: number; productName: string };

/** "Add to bag" on product cards: adds one and confirms for a moment. */
export function QuickAddButton({ variantId, max, productName }: Props) {
  const t = useTranslations("Product");
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const inCart = cart.lines.find((line) => line.id === variantId)?.quantity ?? 0;

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      disabled={inCart >= max}
      onClick={() => {
        cart.add(variantId);
        setAdded(true);
      }}
      className="btn-ink min-h-9 px-4 text-[0.65rem] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {added ? t("added") : t("addToBag")}
      <span className="sr-only"> – {productName}</span>
    </button>
  );
}
