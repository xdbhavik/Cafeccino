/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F0F0F",
        surface: "#1A1A1A",
        "surface-raised": "#242424",
        border: "#2E2E2E",
        accent: "#F5A623",
        "accent-dim": "#3D2B00",
        "text-primary": "#F0EDE8",
        "text-secondary": "#9A9590",
        success: "#4CAF7D",
        danger: "#E05C5C",
        "category-1": "#6C63FF",
        "category-2": "#FF6584",
        "category-3": "#43CFAB",
        "category-4": "#F5A623",
        "category-5": "#56CCF2",
      },
      fontFamily: {
        sora: ["'Sora'", "sans-serif"],
        inter: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        xl: "12px",
        lg: "8px",
        md: "6px",
        "2xl": "16px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.4)",
        elevated: "0 8px 32px rgba(0,0,0,0.6)",
        accent: "0 0 20px rgba(245,166,35,0.25)",
      }
    },
  },
  plugins: [],
}
