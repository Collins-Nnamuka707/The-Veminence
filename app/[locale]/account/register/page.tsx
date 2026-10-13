import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/store/account/AuthForms";
import { AuthShell } from "@/components/store/account/AuthShell";
import { rich } from "@/components/store/rich";
import type { Locale } from "@/i18n/routing";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/register">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "Account.register" });
  return { title: t("title"), alternates: localeAlternates(locale, "/account/register"), robots: { index: false } };
}

export default async function Page() {
  const t = await getTranslations("Account.register");
  return (
    <AuthShell title={t.rich("heading", rich)} intro={t("intro")}>
      <RegisterForm />
    </AuthShell>
  );
}
