import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mountain: {
          darkest: "#011120",
          darker: "#05294A",
          dark: "#093B67",
          medium: "#09467C",
          light: "#0B5394",
        },
      },
    },
  },
  plugins: [],
};
export default config;
