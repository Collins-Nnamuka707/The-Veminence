import { Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";

// latin-ext is required for Polish (ą ć ę ł ń ó ś ź ż).
export const sans = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const script = Pinyon_Script({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});
