import { describe, expect, it } from "vitest";
import { whatsappNumberSchema } from "@/lib/schemas/settings";

describe("whatsappNumberSchema", () => {
  it("accepts international numbers with spaces or dashes", () => {
    expect(whatsappNumberSchema.safeParse("+48 600 100 200").success).toBe(true);
    expect(whatsappNumberSchema.safeParse("48600100200").success).toBe(true);
    expect(whatsappNumberSchema.safeParse("+48-600-100-200").success).toBe(true);
  });

  it("rejects empty, short or non-numeric values", () => {
    expect(whatsappNumberSchema.safeParse("").success).toBe(false);
    expect(whatsappNumberSchema.safeParse("+48 600").success).toBe(false);
    expect(whatsappNumberSchema.safeParse("call me").success).toBe(false);
  });
});
