import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (CSS variable driven)
        ink:          "var(--color-ink)",
        "ink-soft":   "var(--color-ink-soft)",
        indigo:       "var(--color-indigo)",
        "indigo-tint":"var(--color-indigo-tint)",
        coral:        "var(--color-coral)",
        "coral-tint": "var(--color-coral-tint)",
        emerald:      "var(--color-emerald)",
        amber:        "var(--color-amber)",
        rose:         "var(--color-rose)",
        "rose-tint":  "var(--color-rose-tint)",
        canvas:       "var(--color-canvas)",
        surface:      "var(--color-surface)",
        "surface-2":  "var(--color-surface-2)",
        border:       "var(--color-border)",
        "text-muted": "var(--color-text-muted)",

        // Electric Blue Design System
        electric: {
          50:  "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#1E3A8A",
        },
        navy: {
          900: "#020617",
          800: "#0F172A",
          700: "#1E293B",
          600: "#334155",
        },
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        neon: {
          blue:   "#3B82F6",
          cyan:   "#06B6D4",
          purple: "#7C3AED",
          violet: "#818CF8",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        sans:    ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        input:  "12px",
        button: "12px",
        card:   "16px",
        sheet:  "24px",
        "2xl":  "20px",
        "3xl":  "24px",
      },
      boxShadow: {
        premium:    "0 4px 30px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)",
        card:       "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
        "card-hover":"0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
        "glow-blue":"0 0 20px rgba(37,99,235,0.5),  0 0 60px rgba(37,99,235,0.2)",
        "glow-cyan":"0 0 20px rgba(6,182,212,0.4),  0 0 60px rgba(6,182,212,0.15)",
        "glow-sm":  "0 0 10px rgba(59,130,246,0.4)",
        "glow-lg":  "0 0 40px rgba(37,99,235,0.4),  0 0 80px rgba(37,99,235,0.15)",
        "inner-glow":"inset 0 0 30px rgba(37,99,235,0.08)",
      },
      backgroundImage: {
        "gradient-blue-cyan":    "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)",
        "gradient-blue-purple":  "linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)",
        "gradient-navy":         "linear-gradient(135deg, #020617 0%, #0F172A 100%)",
        "gradient-surface":      "linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)",
        "radial-blue":           "radial-gradient(circle at center, rgba(37,99,235,0.15) 0%, transparent 70%)",
      },
      animation: {
        float:          "float 6s ease-in-out infinite",
        "float-slow":   "floatSlow 8s ease-in-out infinite",
        "pulse-glow":   "pulse-glow 2s ease-in-out infinite",
        shimmer:        "shimmer 2s linear infinite",
        "spin-slow":    "spin-slow 12s linear infinite",
        "fade-up":      "fadeInUp 0.7s ease-out forwards",
        "fade-left":    "fadeInLeft 0.7s ease-out forwards",
        "fade-right":   "fadeInRight 0.7s ease-out forwards",
        morph:          "morphBlob 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":     { transform: "translateY(-12px) rotate(0.5deg)" },
          "66%":     { transform: "translateY(-6px) rotate(-0.5deg)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-18px)" },
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 20px rgba(37,99,235,0.4)" },
          "50%":     { boxShadow: "0 0 40px rgba(37,99,235,0.8), 0 0 80px rgba(37,99,235,0.3)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        morphBlob: {
          "0%,100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%":     { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
    },
  },
  plugins: [],
};

export default config;
