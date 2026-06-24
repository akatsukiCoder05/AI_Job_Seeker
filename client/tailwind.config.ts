import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        indigo: "var(--color-indigo)",
        "indigo-tint": "var(--color-indigo-tint)",
        coral: "var(--color-coral)",
        "coral-tint": "var(--color-coral-tint)",
        emerald: "var(--color-emerald)",
        amber: "var(--color-amber)",
        rose: "var(--color-rose)",
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        "text-muted": "var(--color-text-muted)",
      },
      fontFamily: {
        display: ["Clash Display", "General Sans", "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        input: "12px",
        button: "12px",
        card: "16px",
        sheet: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 21, 37, 0.04), 0 8px 24px rgba(14, 21, 37, 0.06)",
        "card-hover": "0 4px 6px rgba(14, 21, 37, 0.06), 0 12px 32px rgba(14, 21, 37, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
