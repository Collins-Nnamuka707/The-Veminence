import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProfileForm } from "@/components/store/account/AuthForms";
import { rich } from "@/components/store/rich";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";
import { getCurrentUser } from "@/lib/supabase/server";
import { logout } from "./actions";

type Props = PageProps<"/[locale]/account">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Account.dashboard" });
  return { title: t("title"), alternates: localeAlternates(locale, "/account"), robots: { index: false } };
}

// The account depends on the signed-in customer, so it renders per request inside Suspense.
export default function AccountPage({ params }: Props) {
  return (
    <div className="container-page max-w-2xl pt-12 pb-24">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-image bg-stone" aria-hidden="true" />}>
        <AccountDetails params={params} />
      </Suspense>
    </div>
  );
}

async function AccountDetails({ params }: Pick<Props, "params">) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/account/login`);

  const t = await getTranslations("Account.dashboard");
  const fullName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : "";
  const phone = typeof user.user_metadata.phone === "string" ? user.user_metadata.phone : "";

  return (
    <>
      <h1 className="font-display text-4xl font-medium sm:text-5xl">{t.rich("heading", rich)}</h1>
      <p className="mt-3 text-muted">{t("signedInAs", { email: user.email ?? "" })}</p>

      <section aria-labelledby="profile-title" className="mt-10 rounded-image bg-stone p-6 sm:p-8">
        <h2 id="profile-title" className="font-display text-2xl font-medium">
          {t("profile")}
        </h2>
        <div className="mt-6">
          <ProfileForm fullName={fullName} phone={phone} />
        </div>
      </section>

      <form action={logout} className="mt-10">
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className="btn-outline">
          {t("logout")}
        </button>
      </form>
    </>
  );
}
