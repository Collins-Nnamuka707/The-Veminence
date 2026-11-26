import { ImagePlus, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageSkeleton } from "@/components/admin/PageHeader";
import { Panel } from "@/components/admin/Panel";
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
    <>
      <PageHeader back={{ href: "/admin/products", label: "Products" }} title="Add product" description="Fill in the details, save, then add photos." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <aside className="grid gap-6 lg:sticky lg:top-6 lg:order-2">
          <Panel title="How it works" icon={ListChecks}>
            <ol className="grid gap-3 text-sm">
              {[
                "Name it and choose the type, texture and length.",
                "Set the price and how many you have.",
                'Keep it as "Draft" until it is ready, or publish it straight away.',
                "Save, then add photos on the next page.",
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-gold">{i + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </Panel>
          <div className="flex gap-3 rounded-xl border border-dashed border-gold-dark/50 bg-gold-tint/40 p-4 text-sm">
            <ImagePlus className="mt-0.5 size-4 shrink-0 text-[#6b5e3f]" aria-hidden="true" />
            <p>Photos are added after saving: square photos on a plain background look best in the shop.</p>
          </div>
        </aside>
        <div className="min-w-0 lg:order-1">
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
      </div>
    </>
  );
}
