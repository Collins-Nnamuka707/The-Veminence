import { z } from "zod";
import { routing } from "@/i18n/routing";

// Error messages are codes; forms translate them (messages: Account.errors.*).
const locale = z.enum(routing.locales);
const email = z.email({ error: "invalidEmail" }).max(254, { error: "tooLong" });
// Supabase hashes passwords with bcrypt, which only uses the first 72 bytes.
export const MIN_PASSWORD_LENGTH = 8;
const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, { error: "passwordTooShort" })
  .max(72, { error: "tooLong" });

export const registerSchema = z.object({
  locale,
  fullName: z.string().trim().min(3, { error: "required" }).max(100, { error: "tooLong" }),
  email,
  password,
});

export const loginSchema = z.object({
  locale,
  email,
  password: z.string().min(1, { error: "required" }),
  next: z.string().optional(),
});

export const forgotPasswordSchema = z.object({ locale, email });

export const resetPasswordSchema = z.object({ locale, password });

export const profileSchema = z.object({
  locale,
  fullName: z.string().trim().min(3, { error: "required" }).max(100, { error: "tooLong" }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[\d\s-]{9,20})?$/, { error: "invalidPhone" }),
});
