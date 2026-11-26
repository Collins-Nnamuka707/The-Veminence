import { AlertTriangle, Boxes, History, PackageX } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { StatCard } from "@/components/admin/StatCard";
import { StockChanges } from "@/components/admin/StockChanges";
import { StockList } from "@/components/admin/StockList";
import { listAdminProducts, listRecentStockMovements } from "@/lib/admin/catalog";
import { getStoreSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Stock" };

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
  const lowAt = settings.lowStockThreshold;
  const variants = products.flatMap((p) => p.variants);
  const units = variants.reduce((sum, v) => sum + Math.max(0, v.stockOnHand), 0);
  const soldOut = variants.filter((v) => v.stockOnHand <= 0).length;
  const low = variants.filter((v) => v.stockOnHand > 0 && v.stockOnHand <= lowAt).length;

  return (
    <>
      <PageHeader
        title="Stock"
        description={`Record deliveries, returns and counts. Every change is logged. "Running low" means ${lowAt} or fewer.`}
      />

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={Boxes} label="Units on hand" value={String(units)} note={`Across ${variants.length} products`} compact />
        <StatCard icon={AlertTriangle} label="Running low" value={String(low)} note={`${lowAt} or fewer left`} attention={low > 0} compact />
        <StatCard icon={PackageX} label="Sold out" value={String(soldOut)} note="Restock to sell them again" attention={soldOut > 0} compact />
      </div>

      <StockList products={products} lowAt={lowAt} />

      <Panel id="changes" title="Recent changes" description="The last 20 stock changes, newest first." icon={History} flush className="mt-6 scroll-mt-6">
        <StockChanges movements={movements} />
      </Panel>
    </>
  );
}
