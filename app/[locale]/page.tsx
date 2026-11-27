import { BadgeCheck, CreditCard, Package, Plus, Ruler, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/store/SectionHeading";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getBestSellers, getCategories } from "@/lib/data/catalog";
import { langAttr, t } from "@/lib/i18n-content";
import { localeAlternates } from "@/lib/seo";
import heroImage from "@/public/images/hero-hair.webp";
import curlyImage from "@/public/images/textures/curly.webp";
import kinkyImage from "@/public/images/textures/kinky.webp";
import laceFrontImage from "@/public/images/textures/lace-front.webp";
import straightImage from "@/public/images/textures/straight.webp";
import wavyImage from "@/public/images/textures/wavy.webp";

/** Photo for each texture tile; a texture without one shows the plain stone tile. */
const TEXTURE_IMAGES: Record<string, StaticImageData> = {
  straight: straightImage,
  wavy: wavyImage,
  curly: curlyImage,
  kinky: kinkyImage,
  "lace-front": laceFrontImage,
};

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates(locale as Locale, "") };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const [tr, nav, bestsellers, categories] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Header.nav"),
    getBestSellers(4),
    getCategories(),
  ]);

  const trust = [
    { icon: Sparkles, label: tr("trust.hair") },
    { icon: Truck, label: tr("trust.delivery") },
    { icon: Package, label: tr("trust.lockers") },
    { icon: CreditCard, label: tr("trust.payment") },
  ];
  const types = [
    { href: "/shop/wigs", label: nav("wigs") },
    { href: "/shop/bundles", label: nav("bundles") },
    { href: "/shop/closures-frontals", label: nav("closuresFrontals") },
  ];
  const reasons = [
    { icon: BadgeCheck, title: tr("why.one"), text: tr("why.oneText") },
    { icon: Ruler, title: tr("why.two"), text: tr("why.twoText") },
    { icon: ShieldCheck, title: tr("why.three"), text: tr("why.threeText") },
  ];
  const faq = [1, 2, 3, 4] as const;

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-ink text-white">
        {/* Decorative background photo; the text sits on a dark gradient so it stays readable. */}
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Darken only behind the text (left on wide screens, bottom on phones); the rest stays vivid. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 via-45% to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent sm:hidden" aria-hidden="true" />
        <div className="container-page relative flex min-h-[32rem] flex-col justify-end py-14 sm:min-h-[38rem] lg:py-20">
          <p className="eyebrow text-gold [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">{tr("hero.eyebrow")}</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight uppercase sm:text-6xl lg:text-7xl">
            {tr("hero.title")}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed font-medium text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.75)] sm:text-base">
            {tr("hero.text")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-light">
              {tr("hero.cta")}
            </Link>
            <Link href="/shop/wigs" className="btn border border-white/60 text-white hover:bg-white hover:text-ink">
              {tr("hero.secondary")}
            </Link>
          </div>
        </div>
      </section>

      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 border-b border-stone py-6 lg:grid-cols-4">
        {trust.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-[0.65rem] font-semibold tracking-[0.15em] uppercase">
            <Icon className="size-5 shrink-0 text-gold-dark" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      <section aria-labelledby="bestsellers-title" className="container-page pt-16">
        <SectionHeading
          id="bestsellers-title"
          title={tr("bestsellers.title")}
          text={tr("bestsellers.text")}
          action={
            <Link href="/shop/bestsellers" className="btn-ink">
              {tr("bestsellers.viewAll")}
            </Link>
          }
        />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
          {bestsellers.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 2} />
          ))}
        </div>
      </section>

      <section aria-labelledby="types-title" className="container-page pt-20">
        <SectionHeading id="types-title" title={tr("types.title")} text={tr("types.text")} />
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {types.map((type) => (
            <li key={type.href}>
              <Link href={type.href} className="group on-dark relative flex aspect-[16/9] flex-col justify-end overflow-hidden bg-ink p-6 text-white sm:aspect-[4/5]">
                <span
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,106,0.25),transparent_65%)] transition-opacity duration-500 group-hover:opacity-60"
                  aria-hidden="true"
                />
                <span className="relative text-2xl font-extrabold tracking-tight uppercase">{type.label}</span>
                <span className="relative mt-2 text-[0.65rem] font-semibold tracking-[0.2em] text-gold uppercase underline-offset-4 group-hover:underline">
                  {tr("types.shop")} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="why-title" className="on-dark mt-24 bg-ink py-20 text-white">
        <div className="container-page">
          <h2 id="why-title" className="heading text-center">
            {tr("why.title")}
          </h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-3">
            {reasons.map(({ icon: Icon, title, text }) => (
              <li key={title} className="text-center">
                <Icon className="mx-auto size-8 text-gold" aria-hidden="true" />
                <h3 className="mt-4 text-sm font-bold tracking-[0.15em] uppercase">{title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/75">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="textures-title" className="container-page pt-20">
        <SectionHeading id="textures-title" title={tr("textures.title")} text={tr("textures.text")} />
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => {
            const image = TEXTURE_IMAGES[category.slug];
            return (
              <li key={category.slug}>
                <Link
                  href={`/shop/${category.slug}`}
                  className={`group relative flex aspect-[3/4] items-end overflow-hidden bg-stone p-5 ${image ? "on-dark text-white" : ""}`}
                >
                  {image && (
                    <>
                      {/* Decorative: the texture name below is the link text. */}
                      <Image
                        src={image}
                        alt=""
                        fill
                        placeholder="blur"
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" aria-hidden="true" />
                    </>
                  )}
                  <span
                    className="relative text-lg font-extrabold tracking-[0.1em] uppercase underline-offset-4 group-hover:underline"
                    lang={langAttr(category.name, locale)}
                  >
                    {t(category.name, locale)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="mt-24 scroll-mt-24 bg-cream py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <h2 id="faq-title" className="text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
            {tr("faq.title")}
          </h2>
          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {faq.map((n) => (
              <details key={n} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs font-semibold tracking-[0.12em] uppercase [&::-webkit-details-marker]:hidden">
                  {tr(`faq.q${n}`)}
                  <Plus className="size-5 shrink-0 rounded-full border border-ink p-0.5 transition-transform group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink">{tr(`faq.a${n}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
