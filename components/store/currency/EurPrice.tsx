"use client";

import { useLocale } from "next-intl";
import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/i18n/routing";
import { formatEurEquivalent, type Grosze } from "@/lib/money";

const EurRateContext = createContext<number | null>(null);

/** Makes today's EUR rate (from the root layout) available to every price on the page. */
export function EurRateProvider({ rate, children }: { rate: number | null; children: ReactNode }) {
  return <EurRateContext value={rate}>{children}</EurRateContext>;
}

/**
 * " / €379" after a złoty amount, or just "€379" on its own line (`inline={false}`).
 * Renders nothing when no rate is available.
 */
export function EurPrice({ grosze, inline = true }: { grosze: Grosze; inline?: boolean }) {
  const rate = useContext(EurRateContext);
  const locale = useLocale() as Locale;
  if (!rate) return null;
  const amount = formatEurEquivalent(grosze, rate, locale);
  if (!inline) return <span className="block text-sm font-normal whitespace-nowrap">{amount}</span>;
  return <span className="font-normal whitespace-nowrap"> / {amount}</span>;
}
