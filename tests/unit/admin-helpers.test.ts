import { describe, expect, it } from "vitest";
import { greeting, lastMonths } from "@/lib/admin/months";
import { formatPriceInput, parsePriceInput } from "@/lib/admin/price-input";
import { slugify, uniqueSlug } from "@/lib/admin/slug";

describe("parsePriceInput", () => {
  it("reads prices the way people type them", () => {
    expect(parsePriceInput("1299")).toBe(129900);
    expect(parsePriceInput("1299,00")).toBe(129900);
    expect(parsePriceInput("1 299,99")).toBe(129999);
    expect(parsePriceInput("1299.5")).toBe(129950);
    expect(parsePriceInput(" 89,9 zł ")).toBe(8990);
  });

  it("rejects anything that is not a sensible price", () => {
    for (const bad of ["", "abc", "-10", "0", "0,00", "12,345", "1.299,00", "2000000"]) {
      expect(parsePriceInput(bad), bad).toBeNull();
    }
  });

  it("round-trips with formatPriceInput", () => {
    expect(formatPriceInput(129900)).toBe("1299,00");
    expect(formatPriceInput(8990)).toBe("89,90");
    expect(formatPriceInput(null)).toBe("");
    expect(parsePriceInput(formatPriceInput(94905))).toBe(94905);
  });
});

describe("slugify", () => {
  it("turns names into web addresses, including Polish letters", () => {
    expect(slugify("Łucja")).toBe("lucja");
    expect(slugify("Żaneta – Długa 60 cm")).toBe("zaneta-dluga-60-cm");
    expect(slugify("  Body Wave!! ")).toBe("body-wave");
    expect(slugify("ąćęłńóśźż")).toBe("acelnoszz");
  });

  it("finds a free slug", () => {
    expect(uniqueSlug("amelia", new Set())).toBe("amelia");
    expect(uniqueSlug("amelia", new Set(["amelia", "amelia-2"]))).toBe("amelia-3");
    expect(uniqueSlug("", new Set())).toBe("product");
  });
});

describe("lastMonths", () => {
  it("lists six months ending with the current one, oldest first", () => {
    const months = lastMonths(new Date("2026-11-26T12:00:00Z"));
    expect(months.map((m) => m.key)).toEqual(["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]);
    expect(months[0].label).toBe("Jun");
    expect(months[5].label).toBe("Nov");
  });

  it("crosses the new year", () => {
    expect(lastMonths(new Date("2027-02-10T12:00:00Z")).map((m) => m.key)).toEqual([
      "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02",
    ]);
  });

  it("uses Polish time at the turn of a month", () => {
    // 23:30 UTC on 31 January is already 1 February in Poland.
    expect(lastMonths(new Date("2027-01-31T23:30:00Z"), 1)[0].key).toBe("2027-02");
  });
});

describe("greeting", () => {
  it("follows the hour in Poland", () => {
    expect(greeting(new Date("2026-11-26T07:00:00Z"))).toBe("Good morning"); // 08:00 in Warsaw
    expect(greeting(new Date("2026-11-26T13:00:00Z"))).toBe("Good afternoon");
    expect(greeting(new Date("2026-11-26T19:00:00Z"))).toBe("Good evening");
  });
});
