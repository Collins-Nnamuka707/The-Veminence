"use client";

import { PackageSearch, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminProduct } from "@/lib/admin/catalog";
import { cn } from "@/lib/utils";
import { FilterChips } from "./FilterChips";
import { EmptyState } from "./Panel";
import { productDetails } from "./ProductList";
import { ProductThumb } from "./ProductThumb";
import { StockAdjustDialog } from "./StockAdjustDialog";
import { StockBadge, stockLevel, type StockLevel } from "./StatusBadges";
import { Input } from "./ui/input";

type Filter = "all" | Exclude<StockLevel, "ok">;

export function StockList({ products, lowAt }: { products: AdminProduct[]; lowAt: number }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      products
        .flatMap((product) => product.variants.map((variant) => ({ product, variant, level: stockLevel(variant.stockOnHand, lowAt) })))
        .sort((a, b) => a.variant.stockOnHand - b.variant.stockOnHand || a.product.name.localeCompare(b.product.name)),
    [products, lowAt],
  );

  const shown = rows.filter(
    ({ product, variant, level }) =>
      (filter === "all" || level === filter) &&
      (query.trim() === "" ||
        product.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        (variant.sku ?? "").toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid gap-3 border-b p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <FilterChips
          label="Filter by stock level"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: rows.length },
            { value: "low", label: "Running low", count: rows.filter((r) => r.level === "low").length },
            { value: "out", label: "Sold out", count: rows.filter((r) => r.level === "out").length },
          ]}
        />
        <div className="relative sm:ml-auto sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or SKU"
            aria-label="Search stock"
            className="pl-9"
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={PackageSearch} title={rows.length === 0 ? "No products yet" : "Nothing here"}>
          {rows.length === 0 ? "Stock appears once you add products." : filter !== "all" ? "No products at this stock level." : "Try another search."}
        </EmptyState>
      ) : (
        <ul className="divide-y">
          {shown.map(({ product, variant, level }) => (
            <li key={variant.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-5">
              <Link href={`/admin/products/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3 basis-full sm:basis-auto">
                <ProductThumb imagePath={product.imagePath} name={product.name} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold hover:underline">{product.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {productDetails(product)}
                    {variant.sku && ` · ${variant.sku}`}
                  </span>
                </span>
              </Link>
              <div className="flex flex-1 items-center gap-3 pl-14 sm:flex-none sm:pl-0">
                <span className="flex items-baseline gap-1.5 sm:w-24 sm:justify-end">
                  <span
                    className={cn(
                      "text-lg leading-none font-bold tabular-nums",
                      level === "out" ? "text-red-800" : level === "low" ? "text-amber-800" : undefined,
                    )}
                  >
                    {Math.max(0, variant.stockOnHand)}
                  </span>
                  <span className="text-xs whitespace-nowrap text-muted-foreground">on hand</span>
                </span>
                <span className="sm:w-20">
                  <StockBadge onHand={variant.stockOnHand} lowAt={lowAt} />
                </span>
                <span className="ml-auto">
                  <StockAdjustDialog variantId={variant.id} productName={product.name} onHand={variant.stockOnHand} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
