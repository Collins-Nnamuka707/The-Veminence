import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/store/checkout/CheckoutForm";
import { rich } from "@/components/store/rich";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getProducts } from "@/lib/data/catalog";
import { getStoreSettings } from "@/lib/data/settings";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/checkout">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Checkout" });
  return {
    title: t("title"),
    alternates: localeAlternates(locale, "/checkout"),
    robots: { index: false },
  };
}

export default async function CheckoutPage() {
  const [tr, products] = await Promise.all([getTranslations("Checkout"), getProducts()]);
  const { deliveryFees } = getStoreSettings();

  return (
    <div className="container-page pt-8 pb-24">
      <Link href="/cart" className="inline-flex min-h-11 items-center text-sm text-olive hover:underline">
        ← {tr("backToCart")}
      </Link>
      <h1 className="mt-2 font-display text-4xl font-medium sm:text-5xl">{tr.rich("heading", rich)}</h1>
      <CheckoutForm products={products} deliveryFees={deliveryFees} />
    </div>
  );
}
