import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { StockAdjustDialog } from "@/components/admin/StockAdjustDialog";
import { StockBadge } from "@/components/admin/StatusBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { listAdminProducts, listRecentStockMovements } from "@/lib/admin/catalog";
import { getStoreSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Stock" };

const REASONS: Record<string, string> = {
  initial: "Opening stock",
  restock: "Delivery received",
  return: "Customer return",
  damaged: "Damaged or lost",
  correction: "Stock count",
  adjustment: "Adjustment",
  sale: "Sale",
};

const DATE = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw" });

export default function StockPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Stock />
    </Suspense>
  );
}

async function Stock() {
  const [products, settings, movements] = await Promise.all([
    listAdminProducts(),
    getStoreSettings(),
    listRecentStockMovements(),
  ]);
  const rows = products
    .flatMap((product) => product.variants.map((variant) => ({ product, variant })))
    .sort((a, b) => a.variant.stockOnHand - b.variant.stockOnHand);

  return (
    <>
      <PageHeader
        title="Stock"
        description={`Units on hand per variant, lowest first. "Low" means ${settings.lowStockThreshold} or fewer.`}
      />
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ product, variant }) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{variant.label}</TableCell>
                <TableCell className="text-muted-foreground">{variant.sku ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{variant.stockOnHand}</TableCell>
                <TableCell>
                  <StockBadge onHand={variant.stockOnHand} lowAt={settings.lowStockThreshold} />
                </TableCell>
                <TableCell className="text-right">
                  <StockAdjustDialog variantId={variant.id} productName={product.name} onHand={variant.stockOnHand} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent changes</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stock changes yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {movements.map((m) => (
                <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                  <span>
                    <span className="font-medium">{m.product}</span>{" "}
                    <span className="text-muted-foreground">
                      · {REASONS[m.reason] ?? m.reason}
                      {m.note && ` · ${m.note}`}
                    </span>
                  </span>
                  <span className="flex items-baseline gap-3">
                    <span className={`tabular-nums font-medium ${m.change > 0 ? "text-emerald-700" : "text-destructive"}`}>
                      {m.change > 0 ? `+${m.change}` : m.change}
                    </span>
                    <time dateTime={m.at} className="text-xs text-muted-foreground">
                      {DATE.format(new Date(m.at))}
                    </time>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
