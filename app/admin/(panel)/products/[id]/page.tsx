import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { ProductForm } from "@/components/admin/ProductForm";
import { StockAdjustDialog } from "@/components/admin/StockAdjustDialog";
import { Alert, AlertDescription } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { getAdminProduct, listAdminCategories } from "@/lib/admin/catalog";
import { formatPriceInput } from "@/lib/admin/price-input";

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
  const [product, categories] = await Promise.all([getAdminProduct(id), listAdminCategories()]);
  if (!product) notFound();

  const visible = product.status === "published" || product.status === "coming_soon";

  return (
    <div className="grid max-w-3xl gap-6">
      <div>
        <Link href="/admin/products" className="text-sm text-muted-foreground hover:underline">
          ← Products
        </Link>
        <PageHeader
          title={product.nameEn}
          actions={
            visible ? (
              <Button asChild variant="outline">
                <a href={`/en/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  View in shop
                </a>
              </Button>
            ) : undefined
          }
        />
        {query.created === "1" && (
          <Alert>
            <AlertDescription>
              Product created{visible ? " and live in the shop" : " as a draft"}. Add photos below.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <PhotoManager productId={product.id} productName={product.nameEn} images={product.images} />

      {product.variant && (
        <Card>
          <CardHeader>
            <CardTitle>Stock</CardTitle>
            <CardDescription>{product.variant.stockOnHand} in stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <StockAdjustDialog variantId={product.variant.id} productName={product.nameEn} onHand={product.variant.stockOnHand} />
          </CardContent>
        </Card>
      )}

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
          price: formatPriceInput(product.variant?.price ?? null),
          salePrice: formatPriceInput(product.variant?.salePrice ?? null),
          sku: product.variant?.sku ?? "",
          initialStock: "0",
        }}
      />
    </div>
  );
}
