import type { Config } from "tailwindcss";

// Design tokens. See CLAUDE.md "Design tokens" for usage rules:
// gold is for fills and for text on ink only; on cream use ink or olive for text.
const config: Config = {
  theme: {
    extend: {
      colors: {
        ink: "#141210",
        cream: "#FAF6EE",
        gold: "#D4AF6A",
        "gold-dark": "#B8924C",
        olive: "#6B5E3F",
        stone: "#E9E1D3",
        muted: "#6F6A63",
        sale: "#B4442F",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        image: "16px",
      },
    },
  },
};

export default config;
