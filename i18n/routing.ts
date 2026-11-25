import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl"],
  // English first (owner's decision, 2026-11-25); visitors switch to Polish in the header.
  defaultLocale: "en",
  localePrefix: "always",
  // Always start in English instead of following the browser language or an earlier choice.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
