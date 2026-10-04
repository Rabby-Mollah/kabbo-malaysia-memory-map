import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lotus: {
          cream: "#f7f4ee",       // Alabaster linen paper
          creamDark: "#ede4d8",   // Soft botanical parchment
          sand: "#e2d7c7",        // Warm sand
          blush: "#f7dee2",       // Soft lotus petal blush
          pink: "#eaafb9",        // Mid-petal pink
          rose: "#cf6b7d",        // Petal tip rosy rose
          roseDeep: "#9b3749",    // Deep velvety rose
          greenLight: "#165845",  // Fresh lotus leaf
          green: "#0e4234",       // Signature Lotus pine green
          greenDeep: "#0a3025",   // Dark forest jade
          greenDark: "#06221a",   // Deepest lacquer green
          forest: "#0a3025",      // Dark forest lacquer
          pine: "#0e4234",        // Signature Lotus pine green
          gold: "#dfad40",        // Pollen seed pod gold
          goldLight: "#f3cb69",   // Golden stamen highlight
          stamenGold: "#f3cb69",  // Golden stamen highlight
          moss: "#576b42",        // Botanical stem olive
        },
        malay: {
          emerald: "#0e4234",
          emeraldDeep: "#0a3025",
          emeraldDark: "#06221a",
          gold: "#dfad40",
          goldLight: "#f3cb69",
          cream: "#f7f4ee",
          creamDark: "#ede4d8",
          sand: "#e2d7c7",
          ocean: "#0f3c30",
          oceanDark: "#08251e",
          coral: "#cf6b7d",
          rose: "#eaafb9",
          blush: "#f7dee2",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(10, 48, 37, 0.16)",
        "glass-lg": "0 16px 48px 0 rgba(6, 34, 26, 0.25)",
        "gold-glow": "0 0 25px rgba(223, 173, 64, 0.35)",
        "rose-glow": "0 0 25px rgba(207, 107, 125, 0.4)",
        "lotus-glow": "0 0 30px rgba(14, 66, 52, 0.4)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
