import { describe, expect, it } from "vitest";
import { bestSellers, newIn } from "@/lib/collections";
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
