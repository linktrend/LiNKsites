import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        card: "var(--color-card)",
        "card-foreground": "var(--color-card-foreground)",
        success: "hsl(var(--success))",
        "success-foreground": "hsl(var(--success-foreground))",
        warning: "hsl(var(--warning))",
        "warning-foreground": "hsl(var(--warning-foreground))",
        danger: "hsl(var(--danger))",
        "danger-foreground": "hsl(var(--danger-foreground))",
        "accent-red": "hsl(var(--accent-red))",
        "accent-red-foreground": "hsl(var(--accent-red-foreground))",
        "surface-overlay": "hsl(var(--surface-overlay))",
        border: "var(--color-border, #e2e8f0)",
        input: "var(--color-input, #e2e8f0)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)"
      },
      fontFamily: {
        sans: ["var(--font-family)", "system-ui", "sans-serif"]
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        "4xl": "var(--spacing-4xl)",
        "5xl": "var(--spacing-5xl)",
        "6xl": "var(--spacing-6xl)"
      },
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)"
      },
      transitionTimingFunction: {
        linear: "var(--easing-linear)",
        default: "var(--easing-default)",
        in: "var(--easing-in)",
        out: "var(--easing-out)",
        "in-out": "var(--easing-in-out)",
        bounce: "var(--easing-bounce)",
        elastic: "var(--easing-elastic)"
      },
      animation: {
        "fade-in": "fadeIn var(--duration-normal) var(--easing-default)",
        "fade-out": "fadeOut var(--duration-normal) var(--easing-default)",
        "slide-in-up": "slideInUp var(--duration-normal) var(--easing-default)",
        "slide-in-down": "slideInDown var(--duration-normal) var(--easing-default)",
        "slide-in-left": "slideInLeft var(--duration-normal) var(--easing-default)",
        "slide-in-right": "slideInRight var(--duration-normal) var(--easing-default)",
        "scale-in": "scaleIn var(--duration-normal) var(--easing-default)",
        "bounce-in": "bounceIn var(--duration-slow) var(--easing-bounce)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        },
        slideInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        slideInDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        slideInLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        slideInRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      }
    }
  },
  plugins: []
};

export default config;
