import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { t } from "@/lib/i18n-content";
import type { StoreProduct } from "@/lib/product-state";

type Props = {
  product: StoreProduct;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  dimmed?: boolean;
};

/** Product photo, or a quiet placeholder until the owner uploads one. */
export function ProductImage({ product, locale, sizes, priority = false, dimmed = false }: Props) {
  return (
    <div className={`relative aspect-[4/5] overflow-hidden bg-stone ${dimmed ? "opacity-60" : ""}`}>
      {product.image ? (
        <Image
          src={product.image.src}
          alt={t(product.image.alt, locale) || t(product.name, locale)}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="text-[0.6rem] font-semibold tracking-[0.5em] text-ink/25 uppercase">Veminence</span>
        </div>
      )}
    </div>
  );
}
