import { CircleCheck, ExternalLink, Info } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductStatusBadge, StockBadge } from "@/components/admin/StatusBadges";
import { StockAdjustDialog } from "@/components/admin/StockAdjustDialog";
import { Button } from "@/components/admin/ui/button";
import { getAdminProduct, listAdminCategories } from "@/lib/admin/catalog";
import { formatPriceInput } from "@/lib/admin/price-input";
import { getStoreSettings } from "@/lib/data/settings";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Edit product" };

type Props = PageProps<"/admin/products/[id]">;

export default function EditProductPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditProduct params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditProduct({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [product, categories, settings] = await Promise.all([getAdminProduct(id), listAdminCategories(), getStoreSettings()]);
  if (!product) notFound();

  const visible = product.status === "published" || product.status === "coming_soon";
  const variant = product.variant;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={product.nameEn}
        description={<ProductStatusBadge status={product.status} />}
        actions={
          visible ? (
            <Button asChild variant="outline">
              <a href={`/en/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                View in shop
              </a>
            </Button>
          ) : undefined
        }
      />

      {query.created === "1" && (
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-700/20" role="status">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Product created{visible ? " and live in the shop" : " as a draft"}. Now add photos: the first one is the main photo in
            the shop.
          </p>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <aside className="grid gap-6 lg:sticky lg:top-6 lg:order-2">
          {variant && (
            <Panel title="Stock and price" flush>
              <dl className="divide-y text-sm">
                <div className="flex items-center justify-between gap-3 px-5 py-3">
                  <dt className="text-muted-foreground">In stock</dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-lg font-bold tabular-nums">{Math.max(0, variant.stockOnHand)}</span>
                    <StockBadge onHand={variant.stockOnHand} lowAt={settings.lowStockThreshold} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-3">
                  <dt className="text-muted-foreground">Price</dt>
                  <dd className="tabular-nums">
                    {variant.salePrice !== null ? (
                      <>
                        <span className="font-semibold text-[#b4442f]">{formatPrice(variant.salePrice)}</span>{" "}
                        <s className="text-xs text-muted-foreground">{formatPrice(variant.price)}</s>
                      </>
                    ) : (
                      <span className="font-semibold">{formatPrice(variant.price)}</span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="border-t p-4">
                <StockAdjustDialog variantId={variant.id} productName={product.nameEn} onHand={variant.stockOnHand} block />
              </div>
            </Panel>
          )}
          <PhotoManager productId={product.id} productName={product.nameEn} images={product.images} />
          <p className="flex gap-2 px-1 text-xs text-muted-foreground">
            <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Stock changes are logged on the Stock page. Price changes are kept for the 30-day lowest price.
          </p>
        </aside>

        <div className="min-w-0 lg:order-1">
          <ProductForm
            mode="edit"
            productId={product.id}
            categories={categories}
            initial={{
              nameEn: product.nameEn,
              namePl: product.namePl,
              descriptionEn: product.descriptionEn,
              descriptionPl: product.descriptionPl,
              categoryId: product.categoryId,
              productType: product.productType,
              lengthInches: product.lengthInches === null ? "" : String(product.lengthInches),
              laceSize: product.laceSize,
              density: product.density,
              colour: product.colour,
              hairOrigin: product.hairOrigin,
              status: product.status,
              isNew: product.isNew,
              allowPreorder: product.allowPreorder,
              price: formatPriceInput(variant?.price ?? null),
              salePrice: formatPriceInput(variant?.salePrice ?? null),
              sku: variant?.sku ?? "",
              initialStock: "0",
            }}
          />
        </div>
      </div>
    </>
  );
}
