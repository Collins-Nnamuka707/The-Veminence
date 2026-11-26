import { Montserrat } from "next/font/google";

// One typeface for the whole site (owner's choice, 2026-11-26). latin-ext covers Polish
// (ą ć ę ł ń ó ś ź ż); the variable font provides every weight from 100 to 900.
export const sans = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});
