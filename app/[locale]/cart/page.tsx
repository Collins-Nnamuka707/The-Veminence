import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/store/cart/CartView";
import { rich } from "@/components/store/rich";
import type { Locale } from "@/i18n/routing";
import { getProducts } from "@/lib/data/catalog";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Cart" });
  return {
    title: t("title"),
    alternates: localeAlternates(locale, "/cart"),
    robots: { index: false },
  };
}

// The cart contents live in the browser; the page ships the catalogue so the cart can show
// names, photos and current prices. Checkout recomputes everything on the server.
export default async function CartPage() {
  const [tr, products] = await Promise.all([getTranslations("Cart"), getProducts()]);

  return (
    <div className="container-page pt-12 pb-24">
      <h1 className="font-display text-4xl font-medium sm:text-5xl">{tr.rich("heading", rich)}</h1>
      <CartView products={products} />
    </div>
  );
}
