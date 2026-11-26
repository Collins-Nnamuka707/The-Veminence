import { describe, expect, it } from "vitest";
import { bestSellers, collectionProducts, isCollectionKey, newIn } from "@/lib/collections";
import { product } from "./fixtures";

describe("collections", () => {
  const all = [
    product({ id: "a", salesCount: 5 }),
    product({ id: "b", salesCount: 40, isNew: true }),
    product({ id: "c", salesCount: 0, isNew: true }),
    product({ id: "d", salesCount: 90, status: "coming_soon" }),
    product({ id: "e", salesCount: 40 }),
  ];

  it("New in lists the new wigs", () => {
    expect(newIn(all).map((p) => p.id)).toEqual(["b", "c"]);
  });

  it("Best sellers ranks by sales, skipping unsold and coming-soon wigs", () => {
    expect(bestSellers(all).map((p) => p.id)).toEqual(["b", "e", "a"]);
    expect(bestSellers(all, 1).map((p) => p.id)).toEqual(["b"]);
  });

  it("Best sellers falls back to buyable wigs before anything has sold", () => {
    const unsold = [
      product({ id: "x" }),
      product({ id: "soldout", available: 0 }),
      product({ id: "soon", status: "coming_soon" }),
      product({ id: "y" }),
    ];
    expect(bestSellers(unsold).map((p) => p.id)).toEqual(["x", "y"]);
  });
});

describe("collectionProducts", () => {
  const all = [
    product({ id: "w", productType: "wig", category: "wavy" }),
    product({ id: "l", productType: "wig", category: "lace-front" }),
    product({ id: "b", productType: "bundle", category: "straight" }),
    product({ id: "c", productType: "closure", category: "straight" }),
    product({ id: "f", productType: "frontal", category: "curly", isNew: true }),
  ];
  const ids = (key: Parameters<typeof collectionProducts>[0]) => collectionProducts(key, all).map((p) => p.id);

  it("groups closures and frontals together, and filters by type and texture", () => {
    expect(ids("wigs")).toEqual(["w", "l"]);
    expect(ids("lace-front")).toEqual(["l"]);
    expect(ids("bundles")).toEqual(["b"]);
    expect(ids("closures-frontals")).toEqual(["c", "f"]);
    expect(ids("straight")).toEqual(["b", "c"]);
    expect(ids("new")).toEqual(["f"]);
  });

  it("knows which keys are collections", () => {
    expect(isCollectionKey("wigs")).toBe(true);
    expect(isCollectionKey("kinky")).toBe(true);
    // Lace front is a texture (owner, 2026-11-26), not a type of its own.
    expect(isCollectionKey("lace-front")).toBe(true);
    expect(isCollectionKey("lace-fronts")).toBe(false);
  });
});
