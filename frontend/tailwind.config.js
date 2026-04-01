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
          950: "#050708", // Pitch black
          900: "#0b1416", // Main background
          800: "#1a282d", // Sidebar/Cards
          750: "#212f34", // Elevated state
          700: "#27343a", // Hover/Input
          600: "#3d4e56", // Borders
        },
        gray: {
          500: "#545657", // Muted text
          400: "#818384", // Supporting text
          300: "#d7dadc", // Main text
          200: "#edeff1", // Brighter details
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        'glass-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
        'orange-glow': '0 0 20px -5px rgba(255, 69, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
