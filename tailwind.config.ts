import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F766E",
          dark: "#115E59",
          light: "#14B8A6",
        },
        accent: {
          DEFAULT: "#EA580C",
          dark: "#C2410C",
          light: "#FB923C",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1FAE54",
        },
        success: "#16A34A",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        urdu: ["var(--font-noto-urdu)", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
