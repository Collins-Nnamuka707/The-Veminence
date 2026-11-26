import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { StockBadge } from "@/components/admin/StatusBadges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { listAdminProducts } from "@/lib/admin/catalog";
import { getStoreSettings } from "@/lib/data/settings";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const [products, settings] = await Promise.all([listAdminProducts(), getStoreSettings()]);
  const variants = products.flatMap((p) =>
    p.status === "published" ? p.variants.filter((v) => v.isActive).map((v) => ({ product: p, variant: v })) : [],
  );
  const lowAt = settings.lowStockThreshold;
  const alerts = variants.filter(({ variant }) => variant.stockOnHand <= lowAt);
  const soldOut = alerts.filter(({ variant }) => variant.stockOnHand === 0).length;

  return (
    <>
      <PageHeader title="Dashboard" description="Your shop at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Revenue this month" value={formatPrice(0)} note="No orders yet" />
        <Stat title="Orders this month" value="0" note="Orders are saved once checkout records them" />
        <Stat
          title="Products on sale"
          value={String(products.filter((p) => p.status === "published").length)}
          note={`${products.length} in total, including drafts and coming soon`}
        />
        <Stat title="Stock alerts" value={String(alerts.length)} note={`${soldOut} sold out, ${alerts.length - soldOut} low`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue, last 6 months</CardTitle>
            <CardDescription>Monthly totals of paid orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No paid orders yet. The chart fills in as orders come in.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs restocking</CardTitle>
            <CardDescription>Published wigs with {lowAt} or fewer left.</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Everything is well stocked.</p>
            ) : (
              <ul className="divide-y">
                {alerts.map(({ product, variant }) => (
                  <li key={variant.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      {product.name}
                      {product.variants.length > 1 && <span className="text-muted-foreground"> · {variant.label}</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums">{variant.stockOnHand} left</span>
                      <StockBadge onHand={variant.stockOnHand} lowAt={lowAt} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/stock" className="mt-3 inline-block text-sm font-medium underline underline-offset-4">
              View all stock
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
