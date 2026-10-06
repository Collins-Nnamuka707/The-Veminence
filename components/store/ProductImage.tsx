import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { t } from "@/lib/i18n-content";
import type { CategorySlug, StoreProduct } from "@/lib/product-state";
import { HairPattern } from "./HairPattern";

const patternFor: Record<CategorySlug, "straight" | "wavy" | "curly"> = {
  straight: "straight",
  "lace-front": "straight",
  wavy: "wavy",
  curly: "curly",
};

type Props = {
  product: StoreProduct;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  dimmed?: boolean;
};

/** Product photo, or a decorative pattern while the product has no photo yet. */
export function ProductImage({ product, locale, sizes, priority = false, dimmed = false }: Props) {
  return (
    <div
      className={`relative aspect-[4/5] overflow-hidden rounded-image bg-stone ${dimmed ? "opacity-60" : ""}`}
    >
      {product.image ? (
        <Image
          src={product.image.src}
          alt={t(product.image.alt, locale)}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <HairPattern
          variant={patternFor[product.category]}
          color="#6B5E3F"
          className="size-full transition-transform duration-500 group-hover:scale-105"
        />
      )}
    </div>
  );
}
