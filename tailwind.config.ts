import type { Config } from "tailwindcss";

/**
 * Design system: "Indigo Professional Educational" (Material 3), ported from
 * the Stitch handoff. The existing semantic names (indigo.*, brass, ink,
 * paper) are remapped onto Material 3 values so every page adopts the new
 * look; the full M3 token set is added for pages built against it directly.
 *
 * NOTE: `adlam-display` maps to Noto Sans Adlam, NOT Hanken Grotesk — the
 * Stitch export mapped it to Hanken, which cannot render ADLaM glyphs.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Existing semantic names, remapped to Material 3 values.
        indigo: { deep: "#24389c", brand: "#3f51b5", soft: "#dee0ff" },
        brass: "#854d00",
        ink: "#1a1c1e",
        paper: "#f9f9fc",

        // Material 3 token set (from the Stitch design).
        primary: "#24389c",
        "on-primary": "#ffffff",
        "primary-container": "#3f51b5",
        "on-primary-container": "#cacfff",
        "primary-fixed": "#dee0ff",
        "on-primary-fixed": "#00105c",
        "inverse-primary": "#bac3ff",
        secondary: "#5b5e68",
        "secondary-container": "#e0e2ee",
        "on-secondary-container": "#61646e",
        tertiary: "#643900",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#854d00",
        "on-tertiary-container": "#ffc893",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        background: "#f9f9fc",
        "on-background": "#1a1c1e",
        surface: "#f9f9fc",
        "on-surface": "#1a1c1e",
        "on-surface-variant": "#454652",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f6",
        "surface-container": "#eeeef0",
        "surface-container-high": "#e8e8ea",
        "surface-container-highest": "#e2e2e5",
        outline: "#757684",
        "outline-variant": "#c5c5d4",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        base: "8px",
        gutter: "24px",
        "margin-mobile": "16px",
        "margin-desktop": "64px",
        "max-width": "1280px",
      },
      maxWidth: {
        "max-width": "1280px",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        adlam: ["var(--font-adlam)", "sans-serif"],
        // M3 role aliases → Hanken Grotesk (body/headline) or Noto Sans Adlam.
        "headline-lg": ["var(--font-display)", "sans-serif"],
        "headline-md": ["var(--font-display)", "sans-serif"],
        "body-lg": ["var(--font-body)", "sans-serif"],
        "body-md": ["var(--font-body)", "sans-serif"],
        "label-md": ["var(--font-body)", "sans-serif"],
        "adlam-display": ["var(--font-adlam)", "sans-serif"],
      },
      fontSize: {
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "500" }],
        "headline-md": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "headline-lg": ["40px", { lineHeight: "52px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "adlam-display": ["48px", { lineHeight: "60px", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};
export default config;
