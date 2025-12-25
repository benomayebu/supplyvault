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
        primary: {
          DEFAULT: "#0A2463",
          navy: "#0A2463",
        },
        secondary: {
          DEFAULT: "#3BCEAC",
          teal: "#3BCEAC",
        },
        accent: {
          DEFAULT: "#FFD700",
          gold: "#FFD700",
        },
        background: {
          DEFAULT: "#F5F5F5",
          light: "#F5F5F5",
        },
      },
    },
  },
  plugins: [],
};

export default config;

