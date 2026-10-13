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
