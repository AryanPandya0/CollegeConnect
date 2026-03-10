/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#ff4500", // Reddit orange-like
        secondary: "#0079d3", // Reddit blue
        dark: {
          900: "#0b1416", // Main background
          800: "#1a282d", // Sidebar/Cards
          700: "#27343a", // Hover/Input
          600: "#3d4e56", // Borders
        },
        gray: {
          400: "#818384", // Supporting text
          300: "#d7dadc", // Main text
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
