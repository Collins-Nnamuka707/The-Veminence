import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, MAX_ITEMS_IN_MESSAGE, type WhatsAppOrder } from "@/lib/whatsapp";

const template = "Zamówienie {reference}\n{items}\nDostawa: {delivery}\nRazem: {total}\n{name}";

const order: WhatsAppOrder = {
  reference: "VEM-1042",
  items: [{ name: "Amelia", variant: "60 cm", quantity: 1 }],
  delivery: "InPost",
  total: 131400,
  name: "Anna Kowalska",
};

const decode = (link: string) => new URL(link).searchParams.get("text") ?? "";

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with digits-only number", () => {
    const link = buildWhatsAppLink("+48 600 100 200", template, order);
    expect(link.startsWith("https://wa.me/48600100200?text=")).toBe(true);
  });

  it("strips a leading 00 international prefix", () => {
    expect(buildWhatsAppLink("0048600100200", template, order)).toContain("wa.me/48600100200?");
  });

  it("fills the template placeholders", () => {
    const text = decode(buildWhatsAppLink("+48600100200", template, order)).replace(/ /g, " ");
    expect(text).toBe("Zamówienie VEM-1042\n1× Amelia (60 cm)\nDostawa: InPost\nRazem: 1314,00 zł\nAnna Kowalska");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(decode(buildWhatsAppLink("+48600100200", "{reference} {unknown}", order))).toBe("VEM-1042 {unknown}");
  });

  it("keeps long orders short", () => {
    const many = {
      ...order,
      items: Array.from({ length: 8 }, (_, i) => ({ name: `Wig ${i}`, variant: "S", quantity: 1 })),
    };
    const lines = decode(buildWhatsAppLink("+48600100200", "{items}", many)).split("\n");
    expect(lines).toHaveLength(MAX_ITEMS_IN_MESSAGE + 1);
    expect(lines.at(-1)).toBe("+3…");
  });

  it("rejects a number that is too short", () => {
    expect(() => buildWhatsAppLink("600", template, order)).toThrow();
  });
});
