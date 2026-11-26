import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <section className="container-page py-24 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight uppercase">{t("title")}</h1>
      <p className="mt-4 text-muted">{t("text")}</p>
      <Link href="/" className="btn-ink mt-8">
        {t("back")}
      </Link>
    </section>
  );
}
