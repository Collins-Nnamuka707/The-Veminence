import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/money";
import type { CardState } from "@/lib/product-state";

type Props = { state: CardState; size?: "sm" | "lg" };

export function Price({ state, size = "sm" }: Props) {
  const t = useTranslations("Product");
  const main = size === "lg" ? "text-2xl" : "text-base";

  if (!state.onSale) {
    return (
      <p className={main}>
        <span className="sr-only">{t("currentPrice")}: </span>
        {formatPrice(state.currentPrice)}
      </p>
    );
  }

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={`${main} font-medium text-sale`}>
          <span className="sr-only">{t("salePrice")}: </span>
          {formatPrice(state.currentPrice)}
        </span>
        <s className="text-sm text-muted">
          <span className="sr-only">{t("regularPrice")}: </span>
          {formatPrice(state.regularPrice)}
        </s>
      </p>
      {state.lowestPrice30d !== null && (
        <p className="mt-1 text-xs leading-snug text-muted">
          {t("lowestPrice", { price: formatPrice(state.lowestPrice30d) })}
        </p>
      )}
    </div>
  );
}
