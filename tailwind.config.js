/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        // For a progress bar that is running but has nothing to report a position for yet. A bar
        // pinned at 0% reads as hung; a moving one reads as working, which is the truth.
        "indeterminate": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(400%)" },
        },
        // The Tablets result: bars grow into place, a chart line draws itself, a verdict fades up, and a
        // super jackpot glows. Used through `motion-safe:` only, so reduced-motion readers get the still.
        "grow-x": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "draw": { from: { strokeDashoffset: "1" }, to: { strokeDashoffset: "0" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "soft-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(252 211 77 / 0)" },
          "50%": { boxShadow: "0 0 10px 2px rgb(252 211 77 / 0.45)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "indeterminate": "indeterminate 1.2s ease-in-out infinite",
        "grow-x": "grow-x 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "draw": "draw 1.2s ease-out both",
        "fade-up": "fade-up 0.45s ease-out both",
        "soft-glow": "soft-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
