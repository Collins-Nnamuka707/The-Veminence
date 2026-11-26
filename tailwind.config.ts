import type { Config } from "tailwindcss";

// Design tokens (redesign 2026-11-26): white pages, black type and buttons, gold accents,
// a soft beige for quiet sections. See CLAUDE.md "Design tokens" for contrast rules.
const config: Config = {
  theme: {
    extend: {
      colors: {
        ink: "#141210",
        cream: "#F4F1EA",
        gold: "#D4AF6A",
        "gold-dark": "#B8924C",
        "gold-tint": "#F5EEDF",
        olive: "#6B5E3F",
        stone: "#EFEDE8",
        muted: "#6F6A63",
        sale: "#B4442F",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // Headings use the same typeface; kept as an alias so `font-display` keeps working.
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        image: "0px",
      },
    },
  },
};

export default config;
