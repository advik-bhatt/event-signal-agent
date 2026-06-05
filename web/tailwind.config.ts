import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f8f6f2",
        charcoal: "#1a1814",
        sage: "#5a7a5a",
        "sage-light": "#7a9a7a",
        "sage-dark": "#3a5a3a",
        amber: "#b8860b",
        muted: "#8c8880",
        "muted-light": "#d4d0c8",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      animation: {
        "breathe-in": "breatheIn 4s ease-in-out infinite",
        "breathe-out": "breatheOut 4s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "pulse-slow": "pulseSlow 6s ease-in-out infinite",
      },
      keyframes: {
        breatheIn: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        breatheOut: {
          "0%, 100%": { transform: "scale(1.08)", opacity: "1" },
          "50%": { transform: "scale(1)", opacity: "0.8" },
        },
        fadeUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
