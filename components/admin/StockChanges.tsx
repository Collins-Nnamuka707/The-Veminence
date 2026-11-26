import { History } from "lucide-react";
import type { StockMovementRow } from "@/lib/admin/catalog";
import { cn } from "@/lib/utils";
import { EmptyState } from "./Panel";

export const STOCK_REASONS: Record<string, string> = {
  initial: "Opening stock",
  restock: "Delivery received",
  return: "Customer return",
  damaged: "Damaged or lost",
  correction: "Stock count",
  adjustment: "Adjustment",
  sale: "Sale",
};

const DATE = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw" });

/** Latest stock changes: what changed, why and when. */
export function StockChanges({ movements }: { movements: StockMovementRow[] }) {
  if (movements.length === 0) {
    return (
      <EmptyState icon={History} title="No stock changes yet">
        Deliveries, returns and counts you record show up here.
      </EmptyState>
    );
  }
  return (
    <ul className="divide-y">
      {movements.map((m) => (
        <li key={m.id} className="flex items-center gap-4 px-5 py-3">
          <span
            className={cn(
              "flex h-7 min-w-12 shrink-0 items-center justify-center rounded-md px-2 text-sm font-semibold tabular-nums",
              m.change > 0 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800",
            )}
          >
            {m.change > 0 ? `+${m.change}` : `−${Math.abs(m.change)}`}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{m.product}</p>
            <p className="truncate text-xs text-muted-foreground">
              {STOCK_REASONS[m.reason] ?? m.reason}
              {m.note && ` · ${m.note}`}
            </p>
          </div>
          <time dateTime={m.at} className="hidden shrink-0 text-xs text-muted-foreground sm:block">
            {DATE.format(new Date(m.at))}
          </time>
        </li>
      ))}
    </ul>
  );
}
