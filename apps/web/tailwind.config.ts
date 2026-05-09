import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101317",
        field: "#e9f5ef",
        cyan: "#25d9f5",
        coral: "#ff6f61",
        court: "#46b27b",
        night: "#16212b"
      },
      boxShadow: {
        nav: "0 14px 45px rgba(12, 18, 25, 0.22)",
        marker: "0 12px 24px rgba(16, 19, 23, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
