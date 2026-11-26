import type { Grosze } from "@/lib/money";

/** Highest price the admin accepts (1 000 000 zł), a guard against typos. */
const MAX_GROSZE = 100_000_000;

/**
 * Reads a price typed by the owner ("1299", "1299,00", "1 299,99", "1299.5") as whole grosze.
 * Returns null for anything else (letters, negatives, more than 2 decimals, zero, huge values).
 */
export function parsePriceInput(input: string): Grosze | null {
  const cleaned = input.replace(/[\s  ]/g, "").replace(/zł$/i, "");
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const grosze = Number(match[1]) * 100 + Number((match[2] ?? "0").padEnd(2, "0"));
  if (!Number.isSafeInteger(grosze) || grosze <= 0 || grosze > MAX_GROSZE) return null;
  return grosze;
}

/** Grosze shown in a price field, e.g. 129900 → "1299,00". */
export function formatPriceInput(grosze: Grosze | null): string {
  if (grosze === null) return "";
  return `${Math.trunc(grosze / 100)},${String(grosze % 100).padStart(2, "0")}`;
}
