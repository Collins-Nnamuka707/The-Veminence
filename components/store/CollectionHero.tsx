import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Dark banner with breadcrumb and big title, then a tinted line of intro text. */
export function CollectionHero({ title, intro, lang }: { title: string; intro?: string; lang?: string }) {
  const t = useTranslations("Shop");
  return (
    <>
      <section className="on-dark relative overflow-hidden bg-ink text-white">
        {/* Subtle texture until the owner adds collection photos. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,106,0.22),transparent_60%)]" aria-hidden="true" />
        <div className="container-page relative flex min-h-56 flex-col justify-end py-10 sm:min-h-72">
          <p className="text-xs text-white/70">
            <Link href="/" className="hover:underline">
              {t("breadcrumb")}
            </Link>{" "}
            / {t("collectionsCrumb")}
          </p>
          <h1 className="mt-3 text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-6xl" lang={lang}>
            {title}
          </h1>
        </div>
      </section>
      {intro && (
        <p className="bg-gold-tint px-4 py-4 text-center text-sm text-ink" lang={lang}>
          {intro}
        </p>
      )}
    </>
  );
}
