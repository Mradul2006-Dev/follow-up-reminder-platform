import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        whatsapp: "#25D366",
        "whatsapp-dark": "#128C7E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
