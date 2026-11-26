import { CircleCheck, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { ProductList } from "@/components/admin/ProductList";
import { Button } from "@/components/admin/ui/button";
import { listAdminProducts } from "@/lib/admin/catalog";
import { getStoreSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Products" };

type Props = PageProps<"/admin/products">;

export default function ProductsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Products searchParams={searchParams} />
    </Suspense>
  );
}

async function Products({ searchParams }: Pick<Props, "searchParams">) {
  const [products, settings, query] = await Promise.all([listAdminProducts(), getStoreSettings(), searchParams]);
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
      {query.deleted === "1" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-700/20" role="status">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>Product deleted. It&apos;s no longer in the shop.</p>
        </div>
      )}
      <ProductList products={products} lowAt={settings.lowStockThreshold} />
    </>
  );
}
