import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indigo: { deep: "#151C3F", brand: "#2B3A8F", soft: "#E7EAF7" },
        brass: "#C79A3B",
        ink: "#1B1F2E",
        paper: "#FAF8F4",
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
