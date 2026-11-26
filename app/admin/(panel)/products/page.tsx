import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { ProductList } from "@/components/admin/ProductList";
import { Button } from "@/components/admin/ui/button";
import { listAdminProducts } from "@/lib/admin/catalog";
import { getStoreSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  const [products, settings] = await Promise.all([listAdminProducts(), getStoreSettings()]);
  const live = products.filter((p) => p.status === "published").length;

  return (
    <>
      <PageHeader
        title="Products"
        description={`${live} in the shop, ${products.length} in total. Click a product to edit it.`}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus />
              Add product
            </Link>
          </Button>
        }
      />
      <ProductList products={products} lowAt={settings.lowStockThreshold} />
    </>
  );
}
