"use client";

import { CircleAlert, CircleCheck, PackageSearch, Pencil, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { AdminProduct } from "@/lib/admin/catalog";
import { formatPrice } from "@/lib/money";
import { ArchiveProductButton, type ProductNotice } from "./ArchiveProductButton";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { FilterChips } from "./FilterChips";
import { EmptyState } from "./Panel";
import { ProductThumb } from "./ProductThumb";
import { PRODUCT_STATUS, ProductStatusBadge, StockBadge } from "./StatusBadges";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/native-select";

export const TYPE_LABELS: Record<string, string> = {
  wig: "Wig",
  bundle: "Bundle",
  closure: "Closure",
  frontal: "Frontal",
};

const STATUS_TABS = ["all", "published", "coming_soon", "draft", "archived"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export function productDetails(product: Pick<AdminProduct, "productType" | "lengthInches" | "category">) {
  return [TYPE_LABELS[product.productType] ?? product.productType, product.lengthInches ? `${product.lengthInches}"` : null, product.category]
    .filter(Boolean)
    .join(" · ");
}

function Price({ product }: { product: AdminProduct }) {
  const variant = product.variants[0];
  if (!variant) return <span className="text-muted-foreground">No price</span>;
  if (variant.salePrice === null) return <>{formatPrice(variant.price)}</>;
  return (
    <span className="inline-flex flex-wrap items-baseline justify-end gap-x-1.5">
      <span className="font-semibold text-[#b4442f]">{formatPrice(variant.salePrice)}</span>
      <s className="text-xs text-muted-foreground">{formatPrice(variant.price)}</s>
    </span>
  );
}

/** Edit, Archive (or Restore) and Delete, at the right edge of each product. */
function RowActions({ product, onNotice }: { product: AdminProduct; onNotice: (notice: ProductNotice) => void }) {
  return (
    <div className="relative z-10 flex items-center justify-end gap-0.5">
      <Button asChild variant="ghost" size="icon" title="Edit">
        <Link href={`/admin/products/${product.id}`} aria-label={`Edit ${product.name}`}>
          <Pencil aria-hidden="true" />
        </Link>
      </Button>
      <ArchiveProductButton productId={product.id} productName={product.name} status={product.status} onNotice={onNotice} />
      <DeleteProductDialog
        productId={product.id}
        productName={product.name}
        photoCount={product.photoCount}
        status={product.status}
        look="icon"
        onNotice={onNotice}
      />
    </div>
  );
}

function NoticeBar({ notice, onUndo, onClose, undoing }: { notice: ProductNotice; onUndo: () => void; onClose: () => void; undoing: boolean }) {
  const error = notice.tone === "error";
  const Icon = error ? CircleAlert : CircleCheck;
  return (
    <div
      className={
        error
          ? "flex items-center gap-3 border-b bg-red-50 px-4 py-2.5 text-sm text-red-900"
          : "flex items-center gap-3 border-b bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900"
      }
      role={error ? "alert" : "status"}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">{notice.text}</p>
      {notice.undo && (
        <Button variant="outline" size="sm" className="bg-white" disabled={undoing} onClick={onUndo}>
          {undoing ? "Undoing…" : "Undo"}
        </Button>
      )}
      <Button variant="ghost" size="icon-sm" aria-label="Dismiss message" onClick={onClose}>
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}

export function ProductList({ products, lowAt }: { products: AdminProduct[]; lowAt: number }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusTab>("all");
  const [type, setType] = useState("all");
  const [notice, setNotice] = useState<ProductNotice | null>(null);
  const [undoing, startUndo] = useTransition();

  function undo() {
    const run = notice?.undo;
    if (!run) return;
    startUndo(async () => {
      const result = await run();
      setNotice(result.error ? { text: result.error, tone: "error" } : { text: "Undone.", tone: "success" });
    });
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const p of products) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [products]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (type === "all" || p.productType === type) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.variants.some((v) => v.sku?.toLowerCase().includes(q))),
    );
  }, [products, query, status, type]);

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid gap-3 border-b p-4">
        <FilterChips
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={STATUS_TABS.map((tab) => ({
            value: tab,
            label: tab === "all" ? "All" : PRODUCT_STATUS[tab].label,
            count: counts[tab] ?? 0,
          }))}
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU"
              aria-label="Search products"
              className="pl-9"
            />
          </div>
          <NativeSelect value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="all">All types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}s
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {notice && <NoticeBar notice={notice} undoing={undoing} onUndo={undo} onClose={() => setNotice(null)} />}

      {shown.length === 0 ? (
        <EmptyState icon={PackageSearch} title={products.length === 0 ? "No products yet" : "No products match"}>
          {products.length === 0 ? "Add your first product to start selling." : "Try another search or filter."}
        </EmptyState>
      ) : (
        <>
          {/* Wide screens: a table. */}
          <table className="hidden w-full text-sm md:table">
            <thead>
              <tr className="border-b text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="px-5 py-3 font-medium">Product</th>
                <th scope="col" className="px-3 py-3 font-medium">Status</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Price</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Stock</th>
                <th scope="col" className="px-3 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shown.map((product) => {
                const stock = product.variants.reduce((sum, v) => sum + v.stockOnHand, 0);
                return (
                  <tr key={product.id} className="group relative transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumb imagePath={product.imagePath} name={product.name} />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-semibold after:absolute after:inset-0 focus-visible:outline-none group-focus-within:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {productDetails(product)}
                            {product.isNew && <span className="ml-2 font-medium text-[#6b5e3f]">New in</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <Price product={product} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="inline-flex items-center gap-2">
                        <span className="tabular-nums">{stock}</span>
                        <StockBadge onHand={stock} lowAt={lowAt} />
                      </span>
                    </td>
                    <td className="py-2 pr-3 pl-1">
                      <RowActions product={product} onNotice={setNotice} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Phones: one card per product. */}
          <ul className="divide-y md:hidden">
            {shown.map((product) => {
              const stock = product.variants.reduce((sum, v) => sum + v.stockOnHand, 0);
              return (
                <li key={product.id} className="relative flex gap-3 p-4 has-[a.card-link:active]:bg-muted/60">
                  <ProductThumb imagePath={product.imagePath} name={product.name} size={64} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/admin/products/${product.id}`} className="card-link block min-w-0 truncate font-semibold after:absolute after:inset-0">
                        {product.name}
                      </Link>
                      <span className="shrink-0 text-sm tabular-nums">
                        <Price product={product} />
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{productDetails(product)}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <ProductStatusBadge status={product.status} />
                      <StockBadge onHand={stock} lowAt={lowAt} />
                      <span className="text-xs text-muted-foreground tabular-nums">{stock} in stock</span>
                    </div>
                    <div className="-mr-2 -mb-2 flex justify-end">
                      <RowActions product={product} onNotice={setNotice} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
