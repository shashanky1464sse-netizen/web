/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic tokens — map to our CSS variables
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        card: {
          DEFAULT: "var(--color-surface)",
          foreground: "var(--color-text)",
        },
        popover: {
          DEFAULT: "var(--color-surface-2)",
          foreground: "var(--color-text)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "#ffffff",
          dim: "var(--color-primary-dim)",
        },
        secondary: {
          DEFAULT: "var(--color-surface-3)",
          foreground: "var(--color-text)",
        },
        muted: {
          DEFAULT: "var(--color-surface-2)",
          foreground: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-text)",
        },
        destructive: {
          DEFAULT: "var(--color-error)",
          foreground: "#ffffff",
        },
        border: "var(--color-border)",
        input: "var(--color-surface-3)",
        ring: "var(--color-primary)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        // Extra surface tokens used in components
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
          3: "var(--color-surface-3)",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        syne: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        DEFAULT: "0 4px 24px rgba(0,0,0,0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
