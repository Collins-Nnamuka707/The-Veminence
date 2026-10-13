import { describe, expect, it } from "vitest";
import { getCartSuggestions, getRelatedProducts } from "@/lib/related";
import { product } from "./fixtures";

const all = [
  product({ id: "wavy-a", category: "wavy", price: 100000 }),
  product({ id: "wavy-b", category: "wavy", price: 150000 }),
  product({ id: "wavy-soldout", category: "wavy", price: 100000, available: 0 }),
  product({ id: "curly-a", category: "curly", price: 100000 }),
  product({ id: "straight-a", category: "straight", price: 300000 }),
];

describe("getRelatedProducts", () => {
  it("prefers the same style, then buyable wigs, then a similar price, excluding itself", () => {
    const ids = getRelatedProducts(all[0], all, 4).map((p) => p.id);
    expect(ids).toEqual(["wavy-b", "wavy-soldout", "curly-a", "straight-a"]);
  });
});

describe("getCartSuggestions", () => {
  it("suggests buyable wigs not already in the cart, matching its styles first", () => {
    const ids = getCartSuggestions(["wavy-a"], all, 3).map((p) => p.id);
    expect(ids).toEqual(["wavy-b", "curly-a", "straight-a"]);
  });

  it("still suggests wigs for an empty cart", () => {
    expect(getCartSuggestions([], all, 2)).toHaveLength(2);
  });
});
