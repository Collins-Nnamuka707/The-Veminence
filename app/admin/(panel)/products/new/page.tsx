import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { listAdminCategories } from "@/lib/admin/catalog";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  const categories = await listAdminCategories();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-muted-foreground hover:underline">
        ← Products
      </Link>
      <PageHeader title="Add product" description="You can add photos on the next page, after saving." />
      <ProductForm
        mode="create"
        categories={categories}
        initial={{
          nameEn: "",
          namePl: "",
          descriptionEn: "",
          descriptionPl: "",
          categoryId: "",
          productType: "wig",
          lengthInches: "",
          laceSize: "",
          density: "",
          colour: "",
          hairOrigin: "",
          status: "draft",
          isNew: true,
          allowPreorder: false,
          price: "",
          salePrice: "",
          sku: "",
          initialStock: "0",
        }}
      />
    </div>
  );
}
