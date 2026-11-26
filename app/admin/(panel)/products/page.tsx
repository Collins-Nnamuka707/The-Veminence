import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { ProductStatusBadge } from "@/components/admin/StatusBadges";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { listAdminProducts } from "@/lib/admin/catalog";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  const products = await listAdminProducts();

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products, including drafts and archived. Click a product to edit it.`}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              Add product
            </Link>
          </Button>
        }
      />
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const variant = product.variants[0];
              const stock = product.variants.reduce((sum, v) => sum + v.stockOnHand, 0);
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/products/${product.id}`} className="underline-offset-4 hover:underline">
                      {product.name}
                    </Link>
                    {product.isNew && <span className="ml-2 text-xs text-muted-foreground">New</span>}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {variant ? (
                      variant.salePrice !== null ? (
                        <>
                          {formatPrice(variant.salePrice)}{" "}
                          <s className="text-muted-foreground">{formatPrice(variant.price)}</s>
                        </>
                      ) : (
                        formatPrice(variant.price)
                      )
                    ) : (
                      <span className="text-muted-foreground">No price</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{stock}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
