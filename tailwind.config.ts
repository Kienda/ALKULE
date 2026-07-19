import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        alkule: { midnight: "#1E1240", deep: "#1A0D3B", teal: "#1BAFCA", cyan: "#48CCE0" },
        indigo: { deep: "#1A0D3B", brand: "#1E1240", soft: "#E9E7EF" },
        brass: "#A56B12", ink: "#171426", paper: "#F5F5F7", muted: "#6E6979", border: "#E5E3EA",
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
