import { z } from "zod";
import { parsePriceInput } from "@/lib/admin/price-input";
import { PRODUCT_TYPES } from "@/lib/product-state";

// Admin forms are English only, so messages are written here directly.

const price = z.string().transform((value, ctx) => {
  const grosze = parsePriceInput(value);
  if (grosze === null) {
    ctx.addIssue({ code: "custom", message: "Enter a price in złoty, for example 1299 or 1299,00." });
    return z.NEVER;
  }
  return grosze;
});

const optionalPrice = z.string().transform((value, ctx) => {
  if (value.trim() === "") return null;
  const grosze = parsePriceInput(value);
  if (grosze === null) {
    ctx.addIssue({ code: "custom", message: "Enter a sale price in złoty, or leave it empty." });
    return z.NEVER;
  }
  return grosze;
});

const shortText = (max: number) =>
  z.string().trim().max(max, { error: `Keep it under ${max} characters.` }).optional().default("");

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on");

export const PRODUCT_STATUSES = ["draft", "published", "coming_soon", "archived"] as const;

export const productFormSchema = z
  .object({
    nameEn: z.string().trim().min(2, { error: "Enter the product name." }).max(120, { error: "Keep the name under 120 characters." }),
    namePl: z.string().trim().max(120, { error: "Keep the name under 120 characters." }).optional().default(""),
    descriptionEn: z.string().trim().max(5000, { error: "Keep the description under 5000 characters." }).optional().default(""),
    descriptionPl: z.string().trim().max(5000, { error: "Keep the description under 5000 characters." }).optional().default(""),
    productType: z.enum(PRODUCT_TYPES, { error: "Choose what kind of product this is." }),
    categoryId: z.uuid({ error: "Choose a texture." }),
    lengthInches: z.coerce
      .number({ error: "Enter the length in inches." })
      .int({ error: "Enter a whole number of inches." })
      .min(4, { error: "Length must be at least 4 inches." })
      .max(40, { error: "Length can be at most 40 inches." }),
    laceSize: shortText(20),
    density: shortText(20),
    colour: shortText(40),
    hairOrigin: shortText(40),
    status: z.enum(PRODUCT_STATUSES, { error: "Choose a status." }),
    isNew: checkbox,
    allowPreorder: checkbox,
    price,
    salePrice: optionalPrice,
    sku: z.string().trim().max(40, { error: "Keep the SKU under 40 characters." }).optional().default(""),
  })
  .refine((v) => v.salePrice === null || v.salePrice < v.price, {
    path: ["salePrice"],
    error: "The sale price must be lower than the price.",
  })
  .refine((v) => !(v.productType === "closure" || v.productType === "frontal") || v.laceSize !== "", {
    path: ["laceSize"],
    error: "Closures and frontals need a lace size, for example 5x5 or 13x4.",
  });

export const newProductFormSchema = productFormSchema.and(
  z.object({
    initialStock: z.coerce
      .number({ error: "Enter how many you have." })
      .int({ error: "Enter a whole number." })
      .min(0, { error: "Stock can't be negative." })
      .max(10000, { error: "That's more than 10 000; check the number." }),
  }),
);

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const STOCK_ACTIONS = {
  restock: { mode: "add", label: "Delivery received", reason: "restock" },
  return: { mode: "add", label: "Customer return", reason: "return" },
  damaged: { mode: "remove", label: "Damaged or lost", reason: "damaged" },
  count: { mode: "set", label: "Stock count (set the exact number)", reason: "correction" },
} as const;

export const stockAdjustSchema = z.object({
  variantId: z.uuid(),
  action: z.enum(Object.keys(STOCK_ACTIONS) as [keyof typeof STOCK_ACTIONS], { error: "Choose what happened." }),
  quantity: z.coerce
    .number({ error: "Enter a number." })
    .int({ error: "Enter a whole number." })
    .min(0, { error: "Enter 0 or more." })
    .max(10000, { error: "That's more than 10 000; check the number." }),
  note: z.string().trim().max(300, { error: "Keep the note under 300 characters." }).optional().default(""),
});
