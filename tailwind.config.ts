import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        alkule: { midnight: "#1E1240", deep: "#1A0D3B", teal: "#1BAFCA", cyan: "#48CCE0" },
        indigo: { deep: "#1A0D3B", brand: "#1E1240", soft: "#E9E7EF" },
        brass: "#A56B12", ink: "#171426", paper: "#F5F5F7", muted: "#6E6979", border: "#E5E3EA",
        primary: "#1E1240",
        "on-primary": "#FFFFFF",
        "primary-container": "#1BAFCA",
        "on-primary-container": "#081C25",
        "primary-fixed": "#E9E7EF",
        "on-primary-fixed": "#1A0D3B",
        "inverse-primary": "#48CCE0",
        secondary: "#6E6979",
        "secondary-container": "#E9E7EF",
        "on-secondary-container": "#171426",
        tertiary: "#A56B12",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#F4E2C5",
        "on-tertiary-container": "#402600",
        error: "#B42318",
        "on-error": "#FFFFFF",
        background: "#F5F5F7",
        "on-background": "#171426",
        surface: "#F5F5F7",
        "on-surface": "#171426",
        "on-surface-variant": "#6E6979",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F5F5F7",
        "surface-container": "#EFEDF3",
        "surface-container-high": "#E9E7EF",
        "surface-container-highest": "#E5E3EA",
        outline: "#777281",
        "outline-variant": "#D5D1DC",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        adlam: ["var(--font-adlam)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
