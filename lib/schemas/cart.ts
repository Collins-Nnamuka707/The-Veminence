import { z } from "zod";

export const MAX_CART_LINES = 50;
export const MAX_LINE_QUANTITY = 99;

/** What the browser keeps (and later sends to checkout): ids and quantities only, never prices. */
export const cartLineSchema = z.object({
  id: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

export const cartSchema = z.array(cartLineSchema).max(MAX_CART_LINES);

export type CartLine = z.infer<typeof cartLineSchema>;
