import { useTranslations } from "next-intl";
import Image, { type StaticImageData } from "next/image";
import { Link } from "@/i18n/navigation";

type Props = { title: string; intro?: string; lang?: string; image?: StaticImageData };

/**
 * Dark banner with breadcrumb and big title, then a tinted line of intro text. With a collection
 * photo, the banner is taller and the photo sits behind it on the right, faded into the dark so the
 * white title stays readable where they overlap.
 */
export function CollectionHero({ title, intro, lang, image }: Props) {
  const t = useTranslations("Shop");
  return (
    <>
      <section className="on-dark relative overflow-hidden bg-ink text-white">
        {image ? (
          // The photo keeps its own shape (as on the home page tile), on the right, fading into the
          // dark banner behind the title. Decorative: the title says what the collection is.
          <div className="absolute inset-y-0 right-0 aspect-[4/5]" aria-hidden="true">
            <Image src={image} alt="" fill priority placeholder="blur" sizes="(min-width: 640px) 340px, 240px" className="object-cover" />
            {/* Soft left edge; on phones the title overlaps the photo, so it is darkened more there. */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink from-5% via-ink/50 via-35% to-transparent to-75%" />
            <div className="absolute inset-0 bg-ink/55 sm:bg-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,106,0.22),transparent_60%)]" aria-hidden="true" />
        )}
        <div className={`container-page relative flex flex-col justify-end py-10 ${image ? "min-h-72 sm:min-h-[26rem]" : "min-h-56 sm:min-h-72"}`}>
          <p className="text-xs text-white/80">
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
