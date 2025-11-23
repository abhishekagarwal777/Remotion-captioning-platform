import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        noto: ["var(--font-noto-sans)", "sans-serif"],
        "noto-devanagari": ["var(--font-noto-devanagari)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
