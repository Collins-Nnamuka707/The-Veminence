import { z } from "zod";
import { parseFeeInput } from "@/lib/admin/price-input";

/** International format, e.g. "+48 600 100 200". */
export const whatsappNumberSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]+$/, "Use digits only, in international format, e.g. +48 600 100 200")
  .refine((value) => value.replace(/\D/g, "").length >= 8, "The number is too short");

const fee = z.string().transform((value, ctx) => {
  const grosze = parseFeeInput(value);
  if (grosze === null) {
    ctx.addIssue({ code: "custom", message: "Enter a fee in złoty, for example 15,99, or 0 for free." });
    return z.NEVER;
  }
  return grosze;
});

/** The admin Settings form (English only, so messages are written here directly). */
export const settingsFormSchema = z.object({
  feeInpostLocker: fee,
  feeCourier: fee,
  feePickup: fee,
  whatsappNumber: whatsappNumberSchema,
  lowStockThreshold: z.coerce
    .number({ error: "Enter a number." })
    .int({ error: "Enter a whole number." })
    .min(0, { error: "Use 0 or more." })
    .max(100, { error: "Use 100 or fewer." }),
});

export type SettingsFormInput = z.infer<typeof settingsFormSchema>;
