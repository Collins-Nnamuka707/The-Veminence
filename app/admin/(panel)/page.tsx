import { AlertTriangle, Boxes, ExternalLink, History, Package, PackageCheck, Plus, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { EmptyState, Panel } from "@/components/admin/Panel";
import { ProductThumb } from "@/components/admin/ProductThumb";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatCard } from "@/components/admin/StatCard";
import { StockBadge } from "@/components/admin/StatusBadges";
import { StockChanges } from "@/components/admin/StockChanges";
import { Button } from "@/components/admin/ui/button";
import { listAdminProducts, listRecentStockMovements } from "@/lib/admin/catalog";
import { greeting, lastMonths } from "@/lib/admin/months";
import { getStoreSettings } from "@/lib/data/settings";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Dashboard" };

const TODAY = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const [products, settings, movements] = await Promise.all([
    listAdminProducts(),
    getStoreSettings(),
    listRecentStockMovements(5),
  ]);
  const now = new Date();
  const lowAt = settings.lowStockThreshold;

  const live = products.filter((p) => p.status === "published");
  const liveVariants = live.flatMap((product) => product.variants.filter((v) => v.isActive).map((variant) => ({ product, variant })));
  const alerts = liveVariants
    .filter(({ variant }) => variant.stockOnHand <= lowAt)
    .sort((a, b) => a.variant.stockOnHand - b.variant.stockOnHand);
  const soldOut = alerts.filter(({ variant }) => variant.stockOnHand <= 0).length;
  const units = liveVariants.reduce((sum, { variant }) => sum + Math.max(0, variant.stockOnHand), 0);

  // Orders are recorded from the next step (docs/PLAN.md, step 4); until then every month is 0.
  const months = lastMonths(now).map((m) => ({ ...m, total: 0 }));
  const thisMonth = months[months.length - 1];

  return (
    <>
      <PageHeader
        title={greeting(now)}
        description={TODAY.format(now)}
        actions={
          <>
            <Button asChild variant="outline">
              <a href="/en" target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                View shop
              </a>
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus />
                Add product
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={Wallet} label={`Revenue in ${thisMonth.label}`} value={formatPrice(thisMonth.total)} note="Paid orders only" />
        <StatCard icon={ShoppingBag} label="Orders this month" value="0" note="No orders yet" href="/admin/orders" />
        <StatCard
          icon={Package}
          label="Products in the shop"
          value={String(live.length)}
          note={`${products.length - live.length} more as drafts, coming soon or archived`}
          href="/admin/products"
        />
        <StatCard
          icon={alerts.length > 0 ? AlertTriangle : PackageCheck}
          label="Stock alerts"
          value={String(alerts.length)}
          note={alerts.length > 0 ? `${soldOut} sold out · ${alerts.length - soldOut} running low` : `All stocked · ${units} units in the shop`}
          href="/admin/stock"
          attention={alerts.length > 0}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel
          title="Revenue, last 6 months"
          description="Monthly totals of paid orders, in złoty."
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <RevenueChart months={months} />
        </Panel>

        <Panel title="Quick actions" icon={Plus}>
          <ul className="grid gap-2">
            {[
              { href: "/admin/products/new", label: "Add a product", note: "Name, price, hair details, photos", icon: Plus },
              { href: "/admin/stock", label: "Record a delivery", note: "Add stock that arrived", icon: Boxes },
              { href: "/admin/orders", label: "See orders", note: "Status and delivery details", icon: ShoppingBag },
            ].map(({ href, label, note, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-foreground/10 transition-colors hover:bg-gold-tint/60 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-ink text-gold" aria-hidden="true">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Needs restocking"
          description={`Products in the shop with ${lowAt} or fewer left.`}
          icon={AlertTriangle}
          flush
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/stock">View stock</Link>
            </Button>
          }
        >
          {alerts.length === 0 ? (
            <EmptyState icon={PackageCheck} title="Everything is well stocked" />
          ) : (
            <ul className="divide-y">
              {alerts.slice(0, 6).map(({ product, variant }) => (
                <li key={variant.id}>
                  <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60">
                    <ProductThumb imagePath={product.imagePath} name={product.name} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{product.name}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">{Math.max(0, variant.stockOnHand)} left</span>
                    </span>
                    <StockBadge onHand={variant.stockOnHand} lowAt={lowAt} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent stock changes"
          icon={History}
          flush
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/stock#changes">See all</Link>
            </Button>
          }
        >
          <StockChanges movements={movements} />
        </Panel>
      </div>
    </>
  );
}
