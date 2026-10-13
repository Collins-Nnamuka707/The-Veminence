import { z } from "zod";
import { routing } from "@/i18n/routing";
import { MIN_PASSWORD_LENGTH } from "./auth";
import { cartSchema } from "./cart";

export const DELIVERY_METHODS = ["inpost_locker", "courier", "pickup"] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

// Error messages are codes; the form translates them (messages: Checkout.errors.*).
const required = (max = 100) =>
  z.string().trim().min(1, { error: "required" }).max(max, { error: "tooLong" });

const contact = {
  locale: z.enum(routing.locales),
  email: z.email({ error: "invalidEmail" }).max(254, { error: "tooLong" }),
  fullName: required(100).refine((v) => v.length >= 3, { error: "required" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{9,20}$/, { error: "invalidPhone" }),
  notes: z.string().trim().max(500, { error: "tooLong" }).optional().default(""),
};

export const checkoutSchema = z.discriminatedUnion("deliveryMethod", [
  z.object({
    ...contact,
    deliveryMethod: z.literal("inpost_locker"),
    // InPost codes look like KRA010M or WAW22A; keep the check loose so no real code is rejected.
    lockerCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}[A-Z0-9]{2,9}$/, { error: "invalidLocker" }),
  }),
  z.object({
    ...contact,
    deliveryMethod: z.literal("courier"),
    street: required(120),
    apartment: z.string().trim().max(20, { error: "tooLong" }).optional().default(""),
    postcode: z
      .string()
      .trim()
      .regex(/^\d{2}-\d{3}$/, { error: "invalidPostcode" }),
    city: required(80),
  }),
  z.object({
    ...contact,
    deliveryMethod: z.literal("pickup"),
  }),
]);

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** The cart arrives as a JSON string of ids and quantities; never prices. */
export const checkoutCartSchema = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "cartEmpty" });
      return z.NEVER;
    }
  })
  .pipe(cartSchema.min(1, { error: "cartEmpty" }));

/**
 * Optional "also create an account" at checkout. Unticked by default: buying never needs an
 * account. The password is only checked when the box is ticked.
 */
export const checkoutAccountSchema = z
  .object({
    createAccount: z
      .string()
      .optional()
      .transform((value) => value === "on"),
    accountPassword: z.string().optional().default(""),
  })
  .superRefine((value, ctx) => {
    if (!value.createAccount) return;
    if (value.accountPassword.length < MIN_PASSWORD_LENGTH) {
      ctx.addIssue({ code: "custom", path: ["accountPassword"], message: "passwordTooShort" });
    } else if (value.accountPassword.length > 72) {
      ctx.addIssue({ code: "custom", path: ["accountPassword"], message: "tooLong" });
    }
  });
