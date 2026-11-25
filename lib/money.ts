/**
 * Money is always an integer number of grosze (1 zł = 100 grosze). Never floats.
 * 129900 grosze = 1299,00 zł.
 */
export type Grosze = number;

const plnFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
});

export function assertGrosze(value: number): asserts value is Grosze {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`Money must be an integer number of grosze, got ${value}`);
  }
}

/** The only way to show a price. Same Polish format on both storefront languages. */
export function formatPrice(grosze: Grosze): string {
  assertGrosze(grosze);
  return plnFormatter.format(grosze / 100);
}

const eurFormatters = {
  en: new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
  pl: new Intl.NumberFormat("pl-PL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
};

/**
 * Display-only euro equivalent of a złoty amount, rounded to whole euros ("€379").
 * Customers always pay in PLN; never use this for totals, payments or stored values.
 * `plnPerEur` is the NBP mid rate (złoty for 1 euro).
 */
export function formatEurEquivalent(grosze: Grosze, plnPerEur: number, locale: "en" | "pl"): string {
  assertGrosze(grosze);
  const euros = Math.round(grosze / (plnPerEur * 100));
  return eurFormatters[locale].format(euros);
}
