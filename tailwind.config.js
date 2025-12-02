/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bullish: '#10b981', // emerald-500
        bearish: '#ef4444', // red-500
        slate: {
          850: '#151e2e', // Custom dark bg
        }
      }
    },
  },
  plugins: [],
}