// tailwind.config.js
export default {
  content: [
    // 明确列出需要扫描的目录
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
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
    }
  },
  plugins: [],
}
