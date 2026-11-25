import { cacheLife } from "next/cache";
import { z } from "zod";

// Official daily EUR rate from the National Bank of Poland (table A, mid rate). Free, no key.
const NBP_EUR_URL = "https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json";
const nbpSchema = z.object({ rates: z.array(z.object({ mid: z.number().positive() })).min(1) });

/**
 * Złoty for 1 euro, refreshed about hourly; null when unavailable, in which case the site shows
 * złoty only. EUR_PLN_RATE overrides the live rate (used by tests).
 */
export async function getEurRate(): Promise<number | null> {
  "use cache";
  cacheLife("hours");

  const fixed = Number(process.env.EUR_PLN_RATE);
  if (fixed > 0) return fixed;

  try {
    const response = await fetch(NBP_EUR_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const parsed = nbpSchema.safeParse(await response.json());
    return parsed.success ? parsed.data.rates[0].mid : null;
  } catch {
    return null;
  }
}
