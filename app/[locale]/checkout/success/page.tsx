import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ClearCart } from "@/components/store/checkout/ClearCart";
import { rich } from "@/components/store/rich";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/supabase/server";

type Props = PageProps<"/[locale]/checkout/success">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Checkout.success" });
  return { title: t("title"), robots: { index: false } };
}

export default function SuccessPage({ searchParams }: Props) {
  return (
    <div className="container-page max-w-2xl pt-16 pb-24 text-center">
      <Suspense fallback={<div className="mx-auto h-40 animate-pulse rounded-image bg-stone" />}>
        <PaymentStatus searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// The page only reports what Stripe says; marking orders paid happens in the webhook
// once orders are stored in the database.
async function PaymentStatus({ searchParams }: Pick<Props, "searchParams">) {
  const tr = await getTranslations("Checkout.success");
  const sessionId = (await searchParams).session_id;
  const [stripe, user] = [getStripe(), await getCurrentUser()];

  let status: "paid" | "processing" | "unknown" = "unknown";
  let email = "";
  if (stripe && typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      email = session.customer_details?.email ?? session.customer_email ?? "";
      if (session.payment_status === "paid" || session.payment_status === "no_payment_required") {
        status = "paid";
      } else if (session.status === "complete") {
        status = "processing";
      }
    } catch (error) {
      console.error("Success page: could not read Stripe session.", error);
    }
  }

  return (
    <>
      {status !== "unknown" && <ClearCart />}
      <h1 className="font-display text-4xl font-medium sm:text-5xl">
        {tr.rich(
          status === "paid" ? "paidHeading" : status === "processing" ? "processingHeading" : "notFoundHeading",
          rich,
        )}
      </h1>
      <p className="mt-6 text-lg">
        {status === "paid"
          ? tr("paidText", { email })
          : status === "processing"
            ? tr("processingText")
            : tr("notFound")}
      </p>
      <Link href="/shop" className="btn-ink mt-10">
        {tr("continue")}
      </Link>
      {status === "paid" && !user && (
        <p className="mt-10 rounded-image bg-stone p-6 text-sm">
          {tr("accountOffer")}{" "}
          <Link href="/account/register" className="font-medium underline underline-offset-4">
            {tr("accountOfferLink")}
          </Link>
        </p>
      )}
    </>
  );
}
