"use client";

import { ChevronRight, PackageSearch, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminProduct } from "@/lib/admin/catalog";
import { formatPrice } from "@/lib/money";
import { FilterChips } from "./FilterChips";
import { EmptyState } from "./Panel";
import { ProductThumb } from "./ProductThumb";
import { PRODUCT_STATUS, ProductStatusBadge, StockBadge } from "./StatusBadges";
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

export function ProductList({ products, lowAt }: { products: AdminProduct[]; lowAt: number }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusTab>("all");
  const [type, setType] = useState("all");

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
                <th scope="col" className="w-10 px-3 py-3"><span className="sr-only">Open</span></th>
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
                    <td className="px-3 py-3 text-muted-foreground">
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
                <li key={product.id}>
                  <Link href={`/admin/products/${product.id}`} className="flex gap-3 p-4 active:bg-muted/60">
                    <ProductThumb imagePath={product.imagePath} name={product.name} size={64} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-semibold">{product.name}</p>
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
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
