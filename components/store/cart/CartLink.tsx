"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { countItems } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";

export function CartLink() {
  const t = useTranslations("Header");
  const count = countItems(useCart().lines);

  return (
    <Link
      href="/cart"
      aria-label={t("cart", { count })}
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-stone"
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" focusable="false">
        <path
          d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z M9 8V6.5a3 3 0 0 1 6 0V8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0.5 flex min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.65rem] leading-5 font-medium text-cream"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
