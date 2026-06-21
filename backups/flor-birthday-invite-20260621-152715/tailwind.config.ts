import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF7E8",
        pink: "#FF3F93",
        coral: "#FF7A59",
        emerald: "#006B50",
        green: "#04A947",
        blue: "#0649F9",
        sky: "#BCE9FB",
        yellow: "#FFE02F",
        ink: "#123126",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        bloom: "0 24px 80px rgba(255, 63, 147, 0.22)",
        hard: "8px 8px 0 #123126",
        pop: "0 18px 50px rgba(6, 73, 249, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
