import { describe, expect, it } from "vitest";
import { t } from "@/lib/i18n-content";
import en from "@/messages/en.json";
import pl from "@/messages/pl.json";

describe("t (owner-managed text)", () => {
  it("returns the requested language", () => {
    expect(t({ pl: "Peruka", en: "Wig" }, "pl")).toBe("Peruka");
    expect(t({ pl: "Peruka", en: "Wig" }, "en")).toBe("Wig");
  });

  it("falls back to Polish when English is missing or blank", () => {
    expect(t({ pl: "Peruka" }, "en")).toBe("Peruka");
    expect(t({ pl: "Peruka", en: null }, "en")).toBe("Peruka");
    expect(t({ pl: "Peruka", en: "   " }, "en")).toBe("Peruka");
  });
});

describe("messages", () => {
  const keys = (obj: object, prefix = ""): string[] =>
    Object.entries(obj).flatMap(([k, v]) =>
      typeof v === "object" && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
    );

  it("pl.json and en.json have the same keys", () => {
    expect(keys(en).sort()).toEqual(keys(pl).sort());
  });
});
