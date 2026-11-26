const TIME_ZONE = "Europe/Warsaw";

export type MonthBucket = { key: string; label: string; year: number };

/**
 * The last `count` calendar months in Polish time, oldest first, ending with the current month.
 * `key` is "YYYY-MM" (for matching order totals), `label` is the short English month name.
 */
export function lastMonths(now: Date, count = 6): MonthBucket[] {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, year: "numeric", month: "numeric" }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value); // 1-12

  const label = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1));
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    return { key: `${y}-${String(m).padStart(2, "0")}`, label: label.format(date), year: y };
  });
}

/** "Good morning" / "Good afternoon" / "Good evening" for the hour in Poland. */
export function greeting(now: Date): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" }).format(now));
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
