import { describe, expect, it } from "vitest";
import { langAttr, t } from "@/lib/i18n-content";
import en from "@/messages/en.json";
import pl from "@/messages/pl.json";

describe("t (owner-managed text)", () => {
  it("returns the requested language", () => {
    expect(t({ en: "Wig", pl: "Peruka" }, "pl")).toBe("Peruka");
    expect(t({ en: "Wig", pl: "Peruka" }, "en")).toBe("Wig");
  });

  it("falls back to English when Polish is missing or blank", () => {
    expect(t({ en: "Wig" }, "pl")).toBe("Wig");
    expect(t({ en: "Wig", pl: null }, "pl")).toBe("Wig");
    expect(t({ en: "Wig", pl: "   " }, "pl")).toBe("Wig");
  });

  it("marks English text shown on a Polish page", () => {
    expect(langAttr({ en: "Wig" }, "pl")).toBe("en");
    expect(langAttr({ en: "Wig", pl: "Peruka" }, "pl")).toBeUndefined();
    expect(langAttr({ en: "Wig" }, "en")).toBeUndefined();
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
