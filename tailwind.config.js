/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neutral-850': '#1f1f1f',
        'dark-bg': '#121212',
      },
      boxShadow: {
        'blue-glow': '0 0 20px rgba(59, 130, 246, 0.25)',
        'blue-glow-sm': '0 0 10px rgba(59, 130, 246, 0.2)',
        'green-glow-sm': '0 0 12px rgba(34, 197, 94, 0.2)',
        'orange-glow-sm': '0 0 12px rgba(249, 115, 22, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
