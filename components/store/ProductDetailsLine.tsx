import { useTranslations } from "next-intl";
import type { StoreProduct } from "@/lib/product-state";

/** "Wig · 24" · 13x4 lace" under a product name. */
export function ProductDetailsLine({ product, className = "" }: { product: StoreProduct; className?: string }) {
  const t = useTranslations("Product");
  const { lengthInches, laceSize } = product.details;
  const parts = [
    t(`types.${product.productType}`),
    lengthInches ? `${lengthInches}"` : null,
    laceSize ? t("lace", { size: laceSize }) : null,
  ].filter(Boolean);
  return <p className={className}>{parts.join(" · ")}</p>;
}
