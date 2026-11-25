import { describe, expect, it } from "vitest";
import { formatEurEquivalent, formatPrice } from "@/lib/money";

// Intl uses non-breaking spaces; normalise them so expectations are readable.
const plain = (s: string) => s.replace(/[  ]/g, " ");

describe("formatPrice", () => {
  it("formats grosze as Polish złoty", () => {
    expect(plain(formatPrice(129900))).toBe("1299,00 zł");
    expect(plain(formatPrice(1234500))).toBe("12 345,00 zł");
    expect(plain(formatPrice(99))).toBe("0,99 zł");
    expect(plain(formatPrice(0))).toBe("0,00 zł");
  });

  it("rejects non-integer amounts", () => {
    expect(() => formatPrice(12.5)).toThrow(TypeError);
    expect(() => formatPrice(Number.NaN)).toThrow(TypeError);
  });
});

describe("formatEurEquivalent", () => {
  it("shows the whole-euro equivalent at the given rate", () => {
    expect(plain(formatEurEquivalent(169900, 4.4809, "en"))).toBe("€379");
    expect(plain(formatEurEquivalent(169900, 4.4809, "pl"))).toBe("379 €");
    expect(plain(formatEurEquivalent(94900, 4.25, "en"))).toBe("€223");
  });

  it("rejects non-integer amounts like formatPrice", () => {
    expect(() => formatEurEquivalent(12.5, 4.25, "en")).toThrow(TypeError);
  });
});
