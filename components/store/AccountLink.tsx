import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function AccountLink() {
  const t = useTranslations("Header");

  return (
    <Link
      href="/account"
      aria-label={t("account")}
      className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-stone"
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" focusable="false">
        <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 20a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
