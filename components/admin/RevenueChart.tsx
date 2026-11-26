import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export type RevenueMonth = { key: string; label: string; total: number };

/** Simple bar chart of monthly revenue in grosze, current month last and in gold. */
export function RevenueChart({ months }: { months: RevenueMonth[] }) {
  const max = Math.max(...months.map((m) => m.total));
  const empty = max === 0;

  return (
    <figure>
      <div className="relative">
        <ol className="flex h-52 items-end gap-3 border-b border-border sm:gap-5" aria-label="Revenue per month">
          {months.map((month, i) => {
            const current = i === months.length - 1;
            const height = empty ? 0 : Math.max(2, Math.round((month.total / max) * 100));
            return (
              <li key={month.key} className="flex h-full flex-1 flex-col justify-end">
                <span className="sr-only">
                  {month.label}: {formatPrice(month.total)}
                </span>
                {!empty && (
                  <span className="mb-1.5 block text-center text-[0.65rem] font-medium text-muted-foreground tabular-nums" aria-hidden="true">
                    {month.total > 0 ? formatPrice(month.total).replace(/,00\s/, " ") : ""}
                  </span>
                )}
                <span
                  className={cn("block w-full rounded-t-md", current ? "bg-gold" : "bg-[#e3ddd0]")}
                  style={{ height: empty ? 4 : `${height}%` }}
                  aria-hidden="true"
                />
              </li>
            );
          })}
        </ol>
        {empty && (
          <p className="absolute inset-x-0 top-1/3 mx-auto max-w-xs text-center text-sm text-muted-foreground">
            No paid orders yet. Each month&apos;s total appears here as orders come in.
          </p>
        )}
      </div>
      <ol className="mt-2 flex gap-3 sm:gap-5" aria-hidden="true">
        {months.map((month, i) => (
          <li
            key={month.key}
            className={cn("flex-1 text-center text-xs", i === months.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground")}
          >
            {month.label}
          </li>
        ))}
      </ol>
    </figure>
  );
}
