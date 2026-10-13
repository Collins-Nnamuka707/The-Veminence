import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/store/account/AuthForms";
import { AuthShell } from "@/components/store/account/AuthShell";
import { rich } from "@/components/store/rich";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/reset-password">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Account.reset" });
  return { title: t("title"), alternates: localeAlternates(locale, "/account/reset-password"), robots: { index: false } };
}

export default async function Page() {
  const t = await getTranslations("Account.reset");
  return (
    <AuthShell title={t.rich("heading", rich)} intro={t("intro")}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
