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
        // Public site keys (DEFAULT/dark/light) plus the admin's numbered
        // shades from the design handoff. brand.DEFAULT === brand.700.
        brand: {
          DEFAULT: "#0F766E",
          dark: "#115E59",
          light: "#14B8A6",
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          400: "#14B8A6",
          700: "#0F766E",
          800: "#115E59",
        },
        accent: {
          DEFAULT: "#EA580C",
          dark: "#C2410C",
          light: "#FB923C",
          50: "#FFF7ED",
          200: "#FED7AA",
          600: "#EA580C",
          700: "#C2410C",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1FAE54",
          hover: "#1FAE54",
        },
        success: "#16A34A",
        warning: "#F59E0B",

        // ── Admin tokens (design-reference/admin-design/tokens) ──────────
        ink: { DEFAULT: "#1C1917", 2: "#44403C" },
        muted: "#78716C",
        line: { DEFAULT: "#E7E5E4", strong: "#D6D3D1" },
        fill: "#F5F5F4",
        page: "#FAFAF9",
        surface: "#FFFFFF",
        // Meanings: text / fill / border / solid — fixed everywhere.
        good: { text: "#15803D", fill: "#F0FDF4", border: "#BBF7D0", solid: "#16A34A" },
        bad: { text: "#B91C1C", fill: "#FEF2F2", border: "#FECACA", solid: "#DC2626" },
        wait: { text: "#B45309", fill: "#FFFBEB", border: "#FDE68A", solid: "#F59E0B" },
        ours: { text: "#0F766E", fill: "#F0FDFA", border: "#99F6E4", solid: "#0F766E" },
        quiet: { text: "#57534E", fill: "#F5F5F4", border: "#E7E5E4", solid: "#A8A29E" },
        chart: {
          whatsapp: "#25D366",
          call: "#0F766E",
          form: "#EA580C",
          website: "#A8A29E",
          opened: "#0F766E",
          shown: "#99F6E4",
          contacted: "#EA580C",
          prev: "#A8A29E",
          grid: "#E7E5E4",
        },
        heat: { 0: "#F5F5F4", 1: "#F0FDFA", 2: "#CCFBF1", 3: "#99F6E4", 4: "#14B8A6", 5: "#0F766E" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        urdu: ["var(--font-noto-urdu)", "serif"],
      },
      fontSize: {
        "page-title": ["28px", { lineHeight: "34px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "page-title-m": ["22px", { lineHeight: "28px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "dialog-title": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "800" }],
        "card-title": ["17px", { lineHeight: "24px", fontWeight: "700" }],
        "card-title-m": ["16px", { lineHeight: "22px", fontWeight: "700" }],
        stat: ["34px", { lineHeight: "38px", fontWeight: "800" }],
        "stat-m": ["28px", { lineHeight: "32px", fontWeight: "800" }],
        body: ["15px", { lineHeight: "24px" }],
        "body-m": ["16px", { lineHeight: "24px" }],
        label: ["13px", { lineHeight: "18px", fontWeight: "500" }],
        overline: ["12px", { lineHeight: "16px", letterSpacing: "0.06em", fontWeight: "600" }],
        "public-h1": ["40px", { lineHeight: "46px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "public-h1-m": ["26px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "800" }],
      },
      borderRadius: {
        "2xl": "1rem",
        card: "16px",
        control: "12px",
        thumb: "9px",
        dialog: "20px",
        sheet: "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,0.04), 0 8px 24px -12px rgba(28,25,23,0.12)",
        pop: "0 16px 48px -16px rgba(28,25,23,0.3), 0 2px 6px rgba(28,25,23,0.06)",
        dialog: "0 24px 48px -16px rgba(28,25,23,0.4)",
        toast: "0 16px 40px -12px rgba(28,25,23,0.5)",
        bar: "0 -8px 24px -16px rgba(28,25,23,0.2)",
        focus: "0 0 0 2px #FFFFFF, 0 0 0 4px #0F766E",
        "input-focus": "0 0 0 3px rgba(15,118,110,0.15)",
        pressed: "inset 0 2px 4px rgba(0,0,0,0.25)",
        thumb: "0 1px 2px rgba(28,25,23,0.12)",
      },
      spacing: { sidebar: "248px", topbar: "76px", "tab-bar": "88px" },
      height: { btn: "40px", "btn-m": "48px", input: "44px", "input-m": "48px", row: "56px" },
      maxWidth: { content: "1128px", form: "760px", public: "720px" },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-480px 0" },
          "100%": { backgroundPosition: "480px 0" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pop-in": {
          "0%": { transform: "translateY(-4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        shimmer: "shimmer 1.4s linear infinite",
        "spin-fast": "spin 0.8s linear infinite",
        "sheet-up": "sheet-up 0.2s ease-out",
        "pop-in": "pop-in 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
