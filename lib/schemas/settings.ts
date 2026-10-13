import { z } from "zod";

/** International format, e.g. "+48 600 100 200". */
export const whatsappNumberSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]+$/, "Use digits only, in international format, e.g. +48 600 100 200")
  .refine((value) => value.replace(/\D/g, "").length >= 8, "The number is too short");
